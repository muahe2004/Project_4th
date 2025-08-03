import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.learning_schedules.learning_schedule_schemas import (
    LearningSchedulePublic,
    LearningScheduleCreate,
    LearningScheduleUpdate,
    LearningScheduleDeleteResponse
)
from app.services.learning_schedules import LearningScheduleServices
from typing import List

router = APIRouter()

# =========================== get all ===========================
@router.get("", response_model=List[LearningSchedulePublic])
def get_learning_schedules(session: SessionDep) -> List[LearningSchedulePublic]:
    return LearningScheduleServices.get_all(session=session)

# =========================== get by id ===========================
@router.get(
    "/{id}",
    response_model=LearningSchedulePublic
)
def get_learning_schedules_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> LearningSchedulePublic:
    return LearningScheduleServices.get_by_id(session=session, learning_schedules_id=id, request=request)

# =========================== add ===========================
@router.post(
    "",
    response_model=LearningSchedulePublic,
)
def create_learning_schedule(
    request: Request, session: SessionDep, data: LearningScheduleCreate
) -> LearningSchedulePublic:
    return LearningScheduleServices.create(session=session, learning_schedules=data)

# =========================== update ===========================
@router.patch(
    "/{id}",
    response_model=LearningSchedulePublic,
)
def update_learning_schedules(
    session: SessionDep, id: uuid.UUID, data: LearningScheduleUpdate
) -> LearningSchedulePublic:
    return LearningScheduleServices.update(session=session, learning_schedule_id=id, learning_schedule_data=data)

# =========================== delete ===========================
@router.delete(
    "/{id}",
    response_model=LearningScheduleDeleteResponse,
)
def delete_learning_schedule(
    session: SessionDep, id: uuid.UUID
) -> LearningScheduleDeleteResponse:
    return LearningScheduleServices.delete(session=session, learning_schedule_id=id)

