import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Interview, Application


_STAGE_ORDER = ["applied", "shortlisted", "test_sent", "tested", "interview_1", "interview_2", "offered", "rejected"]


async def create(
    db: AsyncSession,
    candidate_id: uuid.UUID,
    job_id: uuid.UUID,
    application_id: uuid.UUID | None = None,
    round_number: int = 1,
    interviewer_id: uuid.UUID | None = None,
    status: str = "scheduled",
    scheduled_at: datetime | None = None,
    meet_link: str | None = None,
    notes: str | None = None,
) -> Interview:
    interview = Interview(
        candidate_id=candidate_id,
        job_id=job_id,
        application_id=application_id,
        round_number=round_number,
        interviewer_id=interviewer_id,
        status=status,
        scheduled_at=scheduled_at,
        meet_link=meet_link,
        notes=notes,
    )
    db.add(interview)

    # Atomically advance application stage so pipeline never desyncs
    if application_id:
        app: Application | None = await db.get(Application, application_id)
        if app:
            target = "interview_1" if round_number == 1 else "interview_2"
            current_idx = _STAGE_ORDER.index(app.stage) if app.stage in _STAGE_ORDER else 0
            target_idx = _STAGE_ORDER.index(target)
            if target_idx > current_idx:
                app.stage = target
                app.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(interview)
    return interview


async def list_by_job(db: AsyncSession, job_id: uuid.UUID) -> list[Interview]:
    result = await db.execute(
        select(Interview).where(Interview.job_id == job_id)
        .order_by(Interview.scheduled_at.asc().nullslast())
    )
    return list(result.scalars().all())


async def list_all(db: AsyncSession) -> list[Interview]:
    result = await db.execute(select(Interview))
    return list(result.scalars().all())
