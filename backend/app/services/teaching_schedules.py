import uuid
from app.enums.status import StatusEnum
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Teachers, TeachingSchedules
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import (
    TeachingSchedulPublic,
    TeachingScheduleCreate,
    TeachingScheduleUpdate,
    TeachingScheduleDeleteResponse,
    TeachingScheduleWithLearningSchedulePublic,
)
from app.services.learning_schedules import LearningScheduleServices


class TeachingScheduleServices:
    @staticmethod
    def get_all(*, session: Session) -> List[TeachingSchedulPublic]:
        teaching_schedules = session.exec(select(TeachingSchedules)).all()
        return teaching_schedules

    @staticmethod
    def get_by_id(
        *, session: Session, teaching_schedule_id: uuid.UUID, request: Request
    ) -> TeachingSchedulPublic:
        teaching_schedules = session.get(TeachingSchedules, teaching_schedule_id)
        if not teaching_schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teaching Schedules does not exist",
            )
        return TeachingSchedulPublic.model_validate(teaching_schedules)

    @staticmethod
    def create(
        *, session: Session, teaching_schedule: TeachingScheduleCreate
    ) -> TeachingScheduleWithLearningSchedulePublic:
        if teaching_schedule.teacher_id:
            existing_teacher = session.get(Teachers, teaching_schedule.teacher_id)
            if not existing_teacher:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Teacher does not exist.",
                )

        try:
            new_learning_schedule = LearningScheduleServices.create(
                session=session,
                learning_schedules=teaching_schedule.learning_schedule,
                auto_commit=False,
            )

            new_teaching_schedule = TeachingSchedules(
                teacher_id=teaching_schedule.teacher_id,
                learning_schedule_id=new_learning_schedule.id,
                status=teaching_schedule.status,
            )
            session.add(new_teaching_schedule)
            session.commit()
            session.refresh(new_teaching_schedule)
            return TeachingScheduleWithLearningSchedulePublic(
                id=new_teaching_schedule.id,
                teacher_id=new_teaching_schedule.teacher_id,
                learning_schedule_id=new_teaching_schedule.learning_schedule_id,
                status=new_teaching_schedule.status,
                created_at=new_teaching_schedule.created_at,
                updated_at=new_teaching_schedule.updated_at,
                learning_schedule=new_learning_schedule,
            )
        except HTTPException:
            session.rollback()
            raise
        except Exception:
            session.rollback()
            raise

    @staticmethod
    def update(
        *,
        session: Session,
        teaching_schedule_id: uuid.UUID,
        teaching_schedules_data: TeachingScheduleUpdate,
    ) -> TeachingSchedulPublic:
        relative = session.get(TeachingSchedules, teaching_schedule_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teaching Schedule not found",
            )

        update_data = teaching_schedules_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(relative, field, value)

        session.commit()

        return TeachingSchedulPublic.model_validate(relative)

    @staticmethod
    def delete(
        *, session: Session, teaching_schedule_id: uuid.UUID
    ) -> TeachingScheduleDeleteResponse:
        teaching_schedule = session.get(TeachingSchedules, teaching_schedule_id)
        if not teaching_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teaching Schedule not found",
            )

        if teaching_schedule.status == StatusEnum.ACTIVE:
            teaching_schedule.status = StatusEnum.INACTIVE
            session.commit()
            return TeachingScheduleDeleteResponse(
                id=str(teaching_schedule.id),
                message="Teaching Schedule set to inactive",
            )

        session.delete(teaching_schedule)
        session.commit()

        return TeachingScheduleDeleteResponse(
            id=str(teaching_schedule.id),
            message="Teaching Schedule deleted successfully",
        )
