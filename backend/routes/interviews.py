"""
routes/interviews.py

POST  /api/v1/interviews                    — schedule interview
GET   /api/v1/interviews?job_id=            — list (filter by job)
PATCH /api/v1/interviews/{id}/score         — interviewer submits score → updates Application
PATCH /api/v1/interviews/{id}/status        — mark completed/cancelled
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select
from db.session import get_db
from db.models import Interview, Candidate, Job, HRUser
from services import interview_service, application_service
from services.auth_service import get_current_user
from services.notification_service import send_interview_confirmation, send_interviewer_notification

router = APIRouter()


class InterviewIn(BaseModel):
    candidate_id: uuid.UUID
    job_id: uuid.UUID
    application_id: uuid.UUID | None = None
    round_number: int = 1
    interviewer_id: uuid.UUID | None = None
    status: str = "scheduled"
    scheduled_at: datetime | None = None
    meet_link: str | None = None
    notes: str | None = None


class InterviewOut(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    job_id: uuid.UUID
    application_id: uuid.UUID | None
    round_number: int
    interviewer_id: uuid.UUID | None
    interviewer_name: str | None
    status: str
    scheduled_at: datetime | None
    meet_link: str | None
    notes: str | None
    score: float | None
    feedback: str | None
    candidate_name: str | None

    model_config = {"from_attributes": True}


class ScoreIn(BaseModel):
    score: float
    feedback: str | None = None


class StatusIn(BaseModel):
    status: str


class HRUserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


async def _enrich(db: AsyncSession, interview: Interview) -> InterviewOut:
    candidate: Candidate | None = await db.get(Candidate, interview.candidate_id)
    interviewer: HRUser | None = (
        await db.get(HRUser, interview.interviewer_id) if interview.interviewer_id else None
    )
    data = {c.key: getattr(interview, c.key) for c in interview.__table__.columns}
    data["candidate_name"] = candidate.full_name if candidate else None
    data["interviewer_name"] = interviewer.full_name if interviewer else None
    return InterviewOut(**data)


@router.get("/hr-users", response_model=list[HRUserOut])
async def list_hr_users(
    db: AsyncSession = Depends(get_db),
    _: HRUser = Depends(get_current_user),
):
    result = await db.execute(select(HRUser).where(HRUser.is_active == True).order_by(HRUser.full_name))
    return result.scalars().all()


@router.post("/", response_model=InterviewOut, status_code=201)
async def create_interview(
    body: InterviewIn,
    db: AsyncSession = Depends(get_db),
    _: HRUser = Depends(get_current_user),
):
    interview = await interview_service.create(
        db,
        candidate_id=body.candidate_id,
        job_id=body.job_id,
        application_id=body.application_id,
        round_number=body.round_number,
        interviewer_id=body.interviewer_id,
        status=body.status,
        scheduled_at=body.scheduled_at,
        meet_link=body.meet_link,
        notes=body.notes,
    )

    candidate: Candidate | None = await db.get(Candidate, body.candidate_id)
    job: Job | None = await db.get(Job, body.job_id)
    if candidate and job and body.scheduled_at:
        # Email candidate
        await send_interview_confirmation(
            candidate_email=candidate.email,
            candidate_name=candidate.full_name,
            job_title=job.title,
            interview_date=body.scheduled_at.strftime("%B %d, %Y"),
            interview_time=body.scheduled_at.strftime("%I:%M %p"),
            meet_link=body.meet_link,
            notes=body.notes,
        )
        # Email interviewer if assigned
        if body.interviewer_id:
            from sqlalchemy import select as _select
            from db.models import HRUser
            res = await db.execute(_select(HRUser).where(HRUser.id == body.interviewer_id))
            interviewer: HRUser | None = res.scalar_one_or_none()
            if interviewer:
                await send_interviewer_notification(
                    interviewer_email=interviewer.email,
                    interviewer_name=interviewer.full_name,
                    candidate_name=candidate.full_name,
                    job_title=job.title,
                    interview_date=body.scheduled_at.strftime("%B %d, %Y"),
                    interview_time=body.scheduled_at.strftime("%I:%M %p"),
                    meet_link=body.meet_link,
                    notes=body.notes,
                )

    return await _enrich(db, interview)


@router.get("/", response_model=list[InterviewOut])
async def list_interviews(
    job_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: HRUser = Depends(get_current_user),
):
    interviews = await (interview_service.list_by_job(db, job_id) if job_id else interview_service.list_all(db))
    return [await _enrich(db, iv) for iv in interviews]


@router.patch("/{interview_id}/score", response_model=InterviewOut)
async def submit_score(
    interview_id: uuid.UUID,
    body: ScoreIn,
    db: AsyncSession = Depends(get_db),
    _: HRUser = Depends(get_current_user),
):
    interview: Interview | None = await db.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.score = body.score
    interview.feedback = body.feedback
    interview.status = "completed"
    await db.commit()
    await db.refresh(interview)

    # Propagate score to Application
    if interview.application_id:
        app = await application_service.get_by_id(db, interview.application_id)
        if app:
            await application_service.record_interview_score(
                db, app, body.score, interview.round_number
            )

    return await _enrich(db, interview)


@router.patch("/{interview_id}/status", response_model=InterviewOut)
async def update_status(
    interview_id: uuid.UUID,
    body: StatusIn,
    db: AsyncSession = Depends(get_db),
    _: HRUser = Depends(get_current_user),
):
    interview: Interview | None = await db.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    interview.status = body.status
    await db.commit()
    await db.refresh(interview)
    return await _enrich(db, interview)
