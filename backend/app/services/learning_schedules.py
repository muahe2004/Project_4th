import uuid
from datetime import datetime

from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import LearningSchedules
from app.models.schemas.learning_schedules.learning_schedule_schemas import (
    LearningSchedulePublic,
    LearningScheduleCreate,
    LearningScheduleUpdate,
    LearningScheduleDeleteResponse
)
from app.models.models import TeachingSchedules

from app.enums.status import StatusEnum

class LearningScheduleServices:
    @staticmethod
    def get_all(*, session: Session) -> List[LearningSchedulePublic]:
        learning_schedules = session.exec(select(LearningSchedules)).all()
        return learning_schedules

    @staticmethod
    def get_by_id(
        *, session: Session, learning_schedules_id: uuid.UUID, request: Request
    ) -> LearningSchedulePublic:
        learning_schedules = session.get(LearningSchedules, learning_schedules_id)
        if not learning_schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Learning Schedules does not exist"
            )
        return LearningSchedulePublic.model_validate(learning_schedules)

    @staticmethod
    def create(
        *,
        session: Session,
        learning_schedules: LearningScheduleCreate,
    ) -> LearningSchedulePublic:
        existing = session.exec(
            select(LearningSchedules).where(
                LearningSchedules.class_id == learning_schedules.class_id,
                LearningSchedules.subject_id == learning_schedules.subject_id,
                LearningSchedules.date == learning_schedules.date,
                LearningSchedules.start_period == learning_schedules.start_period,
                LearningSchedules.end_period == learning_schedules.end_period    
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Learning Schedules already exists.",
            )
        new_learning_schedules = LearningSchedules(**learning_schedules.dict())
        session.add(new_learning_schedules)
        session.commit()
        session.refresh(new_learning_schedules)

        return new_learning_schedules

    @staticmethod
    def update(
        *, 
        session: Session,
        learning_schedule_id: uuid.UUID,
        learning_schedule_data: LearningScheduleUpdate,
    ) -> LearningSchedulePublic:
        learning_schedule = session.get(LearningSchedules, learning_schedule_id)
        if not learning_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Learning Schedule not found"
            )

        update_data = learning_schedule_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(learning_schedule, field, value)

        session.commit()
        return LearningSchedulePublic.model_validate(learning_schedule)
    
    @staticmethod
    def delete(
        *,
        session: Session,
        learning_schedule_id: uuid.UUID,
    ) -> LearningScheduleDeleteResponse:
        learning_schedule = session.get(LearningSchedules, learning_schedule_id)
        if not learning_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Learning Schedule not found"
            )

        check_related_entities = select(TeachingSchedules).where(TeachingSchedules.learning_schedule_id == learning_schedule.id)
        teaching_schedules = session.exec(check_related_entities).all()
        if teaching_schedules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Learning Schedule has related Teaching Schedules and cannot be deleted.",
            )

        if learning_schedule.status == StatusEnum.ACTIVE:
            learning_schedule.status = StatusEnum.INACTIVE
            session.commit()
            return LearningScheduleDeleteResponse(id=str(learning_schedule.id), message="Learning Schedule set to inactive")

        session.delete(learning_schedule)
        session.commit()
        return LearningScheduleDeleteResponse(id=str(learning_schedule.id), message="Learning Schedule deleted successfully")