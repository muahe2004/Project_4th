import uuid

from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import ExaminationSchedules
from app.models.schemas.examination_schedules.examination_schedule_schemas import (
    ExaminationSchedulePublic,
    ExaminationScheduleCreate,
    ExaminationScheduleUpdate,
    ExaminationScheduleDeleteResponse,
)

from app.enums.status import StatusEnum


class ExaminationScheduleServices:
    @staticmethod
    def get_all(*, session: Session) -> List[ExaminationSchedulePublic]:
        examination_schedules = session.exec(select(ExaminationSchedules)).all()
        return examination_schedules

    @staticmethod
    def get_by_id(
        *, session: Session, examination_schedules_id: uuid.UUID, request: Request
    ) -> ExaminationSchedulePublic:
        examination_schedule = session.get(
            ExaminationSchedules, examination_schedules_id
        )
        if not examination_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Examination Schedules does not exist",
            )
        return ExaminationSchedulePublic.model_validate(examination_schedule)

    @staticmethod
    def create(
        *,
        session: Session,
        examination_schedule: ExaminationScheduleCreate,
    ) -> ExaminationSchedulePublic:
        existing = session.exec(
            select(ExaminationSchedules).where(
                ExaminationSchedules.class_id == examination_schedule.class_id,
                ExaminationSchedules.subject_id == examination_schedule.subject_id,
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Examination Schedules already exists.",
            )
        new_examination_schedules = ExaminationSchedules(**examination_schedule.dict())
        session.add(new_examination_schedules)
        session.commit()
        session.refresh(new_examination_schedules)

        return new_examination_schedules

    @staticmethod
    def update(
        *,
        session: Session,
        examination_schedule_id: uuid.UUID,
        examination_schedule_data: ExaminationScheduleUpdate,
    ) -> ExaminationSchedulePublic:
        examination_schedule = session.get(
            ExaminationSchedules, examination_schedule_id
        )
        if not examination_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Examination Schedule not found",
            )

        update_data = examination_schedule_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(examination_schedule, field, value)

        session.commit()
        return ExaminationSchedulePublic.model_validate(examination_schedule)

    @staticmethod
    def delete(
        *,
        session: Session,
        examination_schedule_id: uuid.UUID,
    ) -> ExaminationScheduleDeleteResponse:
        examination_schedule = session.get(
            ExaminationSchedules, examination_schedule_id
        )
        if not examination_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Examination Schedule not found",
            )

        if examination_schedule.status == StatusEnum.ACTIVE:
            examination_schedule.status = StatusEnum.INACTIVE
            session.commit()
            return ExaminationScheduleDeleteResponse(
                id=str(examination_schedule.id),
                message="Examination Schedule set to inactive",
            )

        session.delete(examination_schedule)
        session.commit()
        return ExaminationScheduleDeleteResponse(
            id=str(examination_schedule.id),
            message="Examination Schedule deleted successfully",
        )
