import uuid
from datetime import datetime
from app.enums.status import StatusEnum
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import TeachingSchedules
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import (
    TeachingSchedulPublic,
    TeachingScheduleCreate,
    TeachingScheduleUpdate,
    TeachingScheduleDeleteResponse
)

class TeachingScheduleServices:
    @staticmethod
    def get_all(
        *,
        session: Session
    ) -> List[TeachingSchedulPublic]:
        teaching_schedules = session.exec(select(TeachingSchedules)).all()
        return teaching_schedules

    @staticmethod
    def get_by_id(
        *,
        session: Session,
        teaching_schedule_id: uuid.UUID,
        request: Request
    ) -> TeachingSchedulPublic:
        teaching_schedules = session.get(TeachingSchedules, teaching_schedule_id)
        if not teaching_schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Teaching Schedules does not exist"
            )
        return TeachingSchedulPublic.model_validate(teaching_schedules)

    @staticmethod
    def create(
        *,
        session: Session,
        teaching_schedule: TeachingScheduleCreate
    ) -> TeachingSchedulPublic:
        
        new_teaching_schedule = TeachingSchedules(**teaching_schedule.dict())
        session.add(new_teaching_schedule)
        session.commit()
        session.refresh(new_teaching_schedule)

        return new_teaching_schedule
    
    @staticmethod
    def update(
        *,
        session: Session,
        teaching_schedule_id: uuid.UUID,
        teaching_schedules_data: TeachingScheduleUpdate
    ) -> TeachingSchedulPublic:
        relative = session.get(TeachingSchedules, teaching_schedule_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Teaching Schedule not found"
            )
        
        update_data = teaching_schedules_data.model_dump(exclude_unset = True)
        for field, value in update_data.items():
            setattr(relative, field, value)

        session.commit()

        return TeachingSchedulPublic.model_validate(relative)
    

    @staticmethod
    def delete(
        *,
        session: Session,
        teaching_schedule_id: uuid.UUID
    ) -> TeachingScheduleDeleteResponse:
        teaching_schedule = session.get(TeachingSchedules, teaching_schedule_id)
        if not teaching_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Teaching Schedule not found"
            )
        
        if teaching_schedule.status == StatusEnum.ACTIVE:
            teaching_schedule.status = StatusEnum.INACTIVE
            session.commit()
            return TeachingScheduleDeleteResponse(id=str(teaching_schedule.id), message="Teaching Schedule set to inactive")
        
        session.delete(teaching_schedule)
        session.commit()

        return TeachingScheduleDeleteResponse(id=str(teaching_schedule.id), message="Teaching Schedule deleted successfully")