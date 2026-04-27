"""
routes/intake.py

Two intake modes — both converge on the same scoring pipeline:

  Mode A — JSON (Google Form webhook):
    POST /api/v1/intake/submit
    { job_id, full_name, email, phone?, resume_text, cover_note?, linkedin_url? }

  Mode B — File upload (HR uploads PDF/DOCX via ProcessResumes page):
    POST /api/v1/intake/upload-and-preview
    multipart: file + job_id
    → parses file server-side, returns extracted profile for HR to review (no DB write)

    POST /api/v1/intake/confirm
    { job_id, full_name, email, phone?, resume_text (full parsed text) }
    → scores + saves candidate + application + sends ack email

Flow:
  Google Form  →  /intake/submit         (auto, no preview)
  HR Upload    →  /intake/upload-and-preview  →  HR reviews  →  /intake/confirm
"""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from db.models import Job, Candidate, Application
from services import candidate_service, application_service
from services.notification_service import send_application_acknowledgement
from services.profile_extractor import extract_profile, CandidateProfile
from services.jd_matcher import match_candidate_to_jd
from services.parser import parse_resume
from config import settings

router = APIRouter()

_ALLOWED_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


# ---------------------------------------------------------------------------
# Shared response schemas
# ---------------------------------------------------------------------------

class ProfileSummaryOut(BaseModel):
    full_name: str | None
    email: str | None
    phone: str | None
    skills: list[str]
    education: list[str]
    certifications: list[str]
    experience_years: int | None


class PreviewResponse(BaseModel):
    """Returned by upload-and-preview — nothing saved to DB yet."""
    filename: str
    full_text: str
    profile: ProfileSummaryOut
    used_gemini_fallback: bool
    warning: str | None = None


class IntakeResponse(BaseModel):
    candidate_id: str
    application_id: str
    resume_score: float | None
    matched_skills: list[str]
    missing_skills: list[str]
    message: str
    email_sent: bool


# ---------------------------------------------------------------------------
# Mode A — Google Form webhook (JSON body, no auth required)
# ---------------------------------------------------------------------------

class IntakeSubmission(BaseModel):
    job_id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str | None = None
    linkedin_url: str | None = None
    resume_text: str | None = None
    cover_note: str | None = None


@router.post("/submit", response_model=IntakeResponse, status_code=201)
async def intake_submit(
    body: IntakeSubmission,
    db: AsyncSession = Depends(get_db),
) -> IntakeResponse:
    """Google Form webhook — accepts plain text resume, scores and saves."""
    job: Job | None = await db.get(Job, body.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    full_resume = "\n\n".join(filter(None, [
        body.resume_text,
        f"LinkedIn: {body.linkedin_url}" if body.linkedin_url else None,
        f"Cover Note: {body.cover_note}" if body.cover_note else None,
    ]))

    return await _score_and_save(
        db=db,
        job=job,
        full_name=body.full_name,
        email=str(body.email),
        phone=body.phone,
        full_resume=full_resume,
        send_ack=True,
    )


# ---------------------------------------------------------------------------
# Mode B Step 1 — HR uploads file, get preview (nothing saved)
# ---------------------------------------------------------------------------

@router.post("/upload-and-preview", response_model=PreviewResponse)
async def upload_and_preview(
    file: UploadFile = File(...),
    job_id: str = Form(...),
) -> PreviewResponse:
    """
    Parse uploaded PDF/DOCX and return extracted profile for HR to review.
    Nothing is written to the database at this step.
    """
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Allowed: PDF, DOC, DOCX.",
        )

    contents = await file.read()
    if len(contents) / (1024 * 1024) > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit.",
        )

    parsed = parse_resume(
        contents=contents,
        filename=file.filename or "unknown",
        content_type=file.content_type or "",
    )

    profile: CandidateProfile = extract_profile(parsed.full_text)

    warning: str | None = None
    if not profile.email:
        warning = "No email found in resume — please fill it in manually before confirming."
    elif not profile.full_name:
        warning = "Could not detect candidate name — please fill it in manually."

    return PreviewResponse(
        filename=parsed.filename,
        full_text=parsed.full_text,
        profile=ProfileSummaryOut(
            full_name=profile.full_name,
            email=profile.email,
            phone=profile.phone,
            skills=list(profile.skills),
            education=list(profile.education),
            certifications=list(profile.certifications),
            experience_years=profile.experience_years,
        ),
        used_gemini_fallback=parsed.used_gemini_fallback,
        warning=warning,
    )


# ---------------------------------------------------------------------------
# Mode B Step 2 — HR confirms profile, score + save
# ---------------------------------------------------------------------------

class ConfirmSubmission(BaseModel):
    job_id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str | None = None
    resume_text: str  # full parsed text from preview step


@router.post("/confirm", response_model=IntakeResponse, status_code=201)
async def intake_confirm(
    body: ConfirmSubmission,
    db: AsyncSession = Depends(get_db),
) -> IntakeResponse:
    """
    HR-confirmed intake after reviewing the extracted profile.
    Scores against JD using full resume text and saves to DB.
    No acknowledgement email — HR initiated this, not the candidate.
    """
    job: Job | None = await db.get(Job, body.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return await _score_and_save(
        db=db,
        job=job,
        full_name=body.full_name,
        email=str(body.email),
        phone=body.phone,
        full_resume=body.resume_text,
        send_ack=False,
    )


# ---------------------------------------------------------------------------
# Shared scoring + persistence logic
# ---------------------------------------------------------------------------

async def _score_and_save(
    db: AsyncSession,
    job: Job,
    full_name: str,
    email: str,
    phone: str | None,
    full_resume: str,
    send_ack: bool,
) -> IntakeResponse:
    # Duplicate application check — server side, no full-table scan
    existing_candidate = await candidate_service.get_by_email(db, email)

    if existing_candidate:
        dup = await db.execute(
            select(Application).where(
                Application.job_id == job.id,
                Application.candidate_id == existing_candidate.id,
            )
        )
        existing_app = dup.scalar_one_or_none()
        if existing_app:
            return IntakeResponse(
                candidate_id=str(existing_candidate.id),
                application_id=str(existing_app.id),
                resume_score=existing_app.resume_score,
                matched_skills=existing_app.matched_skills or [],
                missing_skills=existing_app.missing_skills or [],
                message="Duplicate application — existing record returned.",
                email_sent=False,
            )
        # Candidate exists but applying to a new job — update their resume text
        candidate = await candidate_service.update_resume(db, existing_candidate, full_resume, phone)
    else:
        candidate = await candidate_service.create(
            db,
            full_name=full_name,
            email=email.lower(),
            resume_text=full_resume or None,
            phone=phone,
        )

    # Score resume against JD using FULL text
    resume_score: float | None = None
    matched_skills: list[str] = []
    missing_skills: list[str] = []

    if full_resume and job.description:
        try:
            profile = extract_profile(full_resume)
            match = await match_candidate_to_jd(profile, job.description, full_resume)
            resume_score = float(match.fit_score)
            matched_skills = list(match.matched_skills)
            missing_skills = list(match.missing_skills)
        except Exception:
            pass  # score stays None — application still created

    app = await application_service.create(
        db,
        job_id=job.id,
        candidate_id=candidate.id,
        resume_score=resume_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
    )

    email_sent = False
    if send_ack:
        email_sent = await send_application_acknowledgement(
            candidate_email=candidate.email,
            candidate_name=candidate.full_name,
            job_title=job.title,
        )

    return IntakeResponse(
        candidate_id=str(candidate.id),
        application_id=str(app.id),
        resume_score=resume_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        message="Application received and scored.",
        email_sent=email_sent,
    )
