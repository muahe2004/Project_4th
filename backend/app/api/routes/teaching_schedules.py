import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import (
    ListTeachingScheduleResponse,
    TeachingScheduleSearchParams,
    TeachingSchedulPublic,
    TeachingScheduleCreate,
    TeachingScheduleUpdate,
    TeachingScheduleDeleteResponse,
    TeachingScheduleWithLearningSchedulePublic,
)
from app.services.teaching_schedules import TeachingScheduleServices

router = APIRouter()


# =========================== get all ===========================
@router.get("", response_model=ListTeachingScheduleResponse)
def get_teaching_schedules(
    session: SessionDep, query: TeachingScheduleSearchParams = Depends()
) -> ListTeachingScheduleResponse:
    teaching_schedules, total = TeachingScheduleServices.get_all(
        session=session, query=query
    )
    return ListTeachingScheduleResponse(data=teaching_schedules, total=total)


# =========================== get by id ===========================
@router.get("/{id}", response_model=TeachingSchedulPublic)
def get_learning_schedules_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> TeachingSchedulPublic:
    return TeachingScheduleServices.get_by_id(
        session=session, teaching_schedule_id=id, request=request
    )


# =========================== add ===========================
@router.post(
    "",
    response_model=TeachingScheduleWithLearningSchedulePublic,
)
def create_department(
    request: Request, session: SessionDep, data: TeachingScheduleCreate
) -> TeachingScheduleWithLearningSchedulePublic:
    return TeachingScheduleServices.create(session=session, teaching_schedule=data)


# =========================== update ===========================
@router.patch(
    "/{id}",
    response_model=TeachingSchedulPublic,
)
def update_teaching_schedules(
    session: SessionDep, id: uuid.UUID, data: TeachingScheduleUpdate
) -> TeachingSchedulPublic:
    return TeachingScheduleServices.update(
        session=session, teaching_schedule_id=id, teaching_schedules_data=data
    )


# =========================== delete ===========================
@router.delete(
    "/{id}",
    response_model=TeachingScheduleDeleteResponse,
)
def delete_teaching_schedule(
    session: SessionDep, id: uuid.UUID
) -> TeachingScheduleDeleteResponse:
    return TeachingScheduleServices.delete(session=session, teaching_schedule_id=id)
