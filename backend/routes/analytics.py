"""
routes/analytics.py

GET /api/v1/analytics/summary?job_id=  — dashboard analytics for a job

Uses scores already stored in the Application table.
No Gemini calls — fast, cheap, accurate.
"""
from __future__ import annotations

import uuid
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from db.models import HRUser, Application, Candidate, Job
from services.auth_service import get_current_user
from services import application_service

router = APIRouter()


class ScoreDistribution(BaseModel):
    excellent: int
    good: int
    moderate: int
    poor: int


class AnalyticsResponse(BaseModel):
    total_candidates: int
    active_candidates: int
    average_fit_score: float
    top_candidate_score: float
    interview_ready_count: int
    offered_count: int
    rejected_count: int
    score_distribution: ScoreDistribution
    stage_breakdown: dict[str, int]
    common_missing_skills: list[str]
    common_matched_skills: list[str]
    insights: dict[str, str]


@router.get("/summary", response_model=AnalyticsResponse)
async def analytics_summary(
    job_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
    _: HRUser = Depends(get_current_user),
) -> AnalyticsResponse:
    """
    Returns analytics for a job using scores already stored in DB.
    No AI calls — instant response.
    """
    job: Job | None = await db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    apps = await application_service.list_by_job(db, job_id)

    if not apps:
        return AnalyticsResponse(
            total_candidates=0, active_candidates=0,
            average_fit_score=0.0, top_candidate_score=0.0,
            interview_ready_count=0, offered_count=0, rejected_count=0,
            score_distribution=ScoreDistribution(excellent=0, good=0, moderate=0, poor=0),
            stage_breakdown={}, common_missing_skills=[], common_matched_skills=[],
            insights={"status": "No candidates yet for this job."},
        )

    active = [a for a in apps if a.stage != "rejected"]
    scores = [a.final_score or a.resume_score or 0.0 for a in active]

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    top_score = max(scores) if scores else 0.0

    dist = ScoreDistribution(
        excellent=sum(1 for s in scores if s >= 80),
        good=sum(1 for s in scores if 60 <= s < 80),
        moderate=sum(1 for s in scores if 40 <= s < 60),
        poor=sum(1 for s in scores if s < 40),
    )

    stage_breakdown = dict(Counter(a.stage for a in apps))

    all_missing = [s for a in apps for s in (a.missing_skills or [])]
    all_matched = [s for a in apps for s in (a.matched_skills or [])]
    top_missing = [s for s, _ in Counter(all_missing).most_common(5)]
    top_matched = [s for s, _ in Counter(all_matched).most_common(5)]

    interview_ready = sum(1 for s in scores if s >= 70)
    offered = sum(1 for a in apps if a.stage == "offered")
    rejected = sum(1 for a in apps if a.stage == "rejected")

    insights: dict[str, str] = {}

    if avg_score >= 70:
        insights["quality"] = "Strong talent pool — high average fit score"
    elif avg_score >= 50:
        insights["quality"] = "Moderate talent pool — consider expanding sourcing"
    else:
        insights["quality"] = "Weak talent pool — review JD requirements or source more candidates"

    interview_rate = (interview_ready / len(active) * 100) if active else 0
    insights["readiness"] = f"{interview_rate:.0f}% of active candidates are interview-ready (score ≥ 70%)"

    if top_missing:
        insights["skill_gaps"] = f"Most common missing skill: {top_missing[0]}"

    if offered > 0:
        insights["pipeline"] = f"{offered} offer(s) sent — pipeline nearing completion"
    elif interview_ready >= 3:
        insights["pipeline"] = "Enough interview-ready candidates — proceed with scheduling"
    else:
        insights["pipeline"] = "Consider shortlisting more candidates before scheduling interviews"

    return AnalyticsResponse(
        total_candidates=len(apps),
        active_candidates=len(active),
        average_fit_score=avg_score,
        top_candidate_score=top_score,
        interview_ready_count=interview_ready,
        offered_count=offered,
        rejected_count=rejected,
        score_distribution=dist,
        stage_breakdown=stage_breakdown,
        common_missing_skills=top_missing,
        common_matched_skills=top_matched,
        insights=insights,
    )
