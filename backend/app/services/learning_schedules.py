import uuid

from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Classes, LearningSchedules, Rooms, Subjects
from app.models.schemas.learning_schedules.learning_schedule_schemas import (
    LearningSchedulePublic,
    LearningScheduleCreate,
    LearningScheduleUpdate,
    LearningScheduleDeleteResponse,
)
from app.models.models import TeachingSchedules

from app.enums.status import StatusEnum


class LearningScheduleServices:
    @staticmethod
    def get_all(*, session: Session) -> List[LearningSchedulePublic]:
        learning_schedules = session.exec(select(LearningSchedules)).all()
        return learning_schedules

    @staticmethod
    def get_by_class(
        *,
        session: Session,
        class_id: uuid.UUID,
    ) -> List[LearningSchedulePublic]:
        learning_schedules = session.exec(
            select(LearningSchedules).where(LearningSchedules.class_id == class_id)
        )

        if not learning_schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning Schedules does not exist",
            )
        return learning_schedules

    @staticmethod
    def get_by_id(
        *, session: Session, learning_schedules_id: uuid.UUID, request: Request
    ) -> LearningSchedulePublic:
        learning_schedules = session.get(LearningSchedules, learning_schedules_id)
        if not learning_schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning Schedules does not exist",
            )
        return LearningSchedulePublic.model_validate(learning_schedules)

    @staticmethod
    def create(
        *,
        session: Session,
        learning_schedules: LearningScheduleCreate,
        auto_commit: bool = True,
    ) -> LearningSchedulePublic:
        existing_class = session.get(Classes, learning_schedules.class_id)
        if not existing_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class does not exist.",
            )

        existing_subject = session.get(Subjects, learning_schedules.subject_id)
        if not existing_subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject does not exist.",
            )

        if learning_schedules.room_id:
            existing_room = session.get(Rooms, learning_schedules.room_id)
            if not existing_room:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Room does not exist.",
                )

        overlapping_schedule = session.exec(
            select(LearningSchedules).where(
                LearningSchedules.class_id == learning_schedules.class_id,
                LearningSchedules.date == learning_schedules.date,
                LearningSchedules.start_period <= learning_schedules.end_period,
                LearningSchedules.end_period >= learning_schedules.start_period,
            )
        ).first()
        if overlapping_schedule:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Learning Schedule overlaps with an existing schedule.",
            )

        new_learning_schedules = LearningSchedules(**learning_schedules.model_dump())
        session.add(new_learning_schedules)
        if auto_commit:
            session.commit()
        else:
            session.flush()
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
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning Schedule not found",
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
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning Schedule not found",
            )

        check_related_entities = select(TeachingSchedules).where(
            TeachingSchedules.learning_schedule_id == learning_schedule.id
        )
        teaching_schedules = session.exec(check_related_entities).all()
        if teaching_schedules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Learning Schedule has related Teaching Schedules and cannot be deleted.",
            )

        if learning_schedule.status == StatusEnum.ACTIVE:
            learning_schedule.status = StatusEnum.INACTIVE
            session.commit()
            return LearningScheduleDeleteResponse(
                id=str(learning_schedule.id),
                message="Learning Schedule set to inactive",
            )

        session.delete(learning_schedule)
        session.commit()
        return LearningScheduleDeleteResponse(
            id=str(learning_schedule.id),
            message="Learning Schedule deleted successfully",
        )
