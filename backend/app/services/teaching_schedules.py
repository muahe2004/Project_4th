import uuid
from datetime import datetime
from app.enums.status import StatusEnum
from fastapi import HTTPException, Request
from sqlmodel import Session, and_, desc, func, or_, select
from sqlalchemy import String, cast
from starlette import status
from typing import List, Tuple

from app.models.models import (
    Classes,
    LearningSchedules,
    Rooms,
    Subjects,
    Teachers,
    TeachingSchedules,
)
from app.models.schemas.learning_schedules.learning_schedule_schemas import (
    LearningSchedulePublic,
)
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import (
    TeachingScheduleClassInfo,
    TeachingScheduleRoomInfo,
    TeachingScheduleResponse,
    TeachingScheduleSearchParams,
    TeachingSchedulPublic,
    TeachingScheduleSubjectInfo,
    TeachingScheduleTeacherInfo,
    TeachingScheduleCreate,
    TeachingScheduleUpdate,
    TeachingScheduleDeleteResponse,
    TeachingScheduleWithLearningSchedulePublic,
)
from app.services.learning_schedules import LearningScheduleServices


class TeachingScheduleServices:
    @staticmethod
    def get_all(
        *, session: Session, query: TeachingScheduleSearchParams
    ) -> Tuple[List[TeachingScheduleResponse], int]:
        statement = (
            select(
                TeachingSchedules,
                LearningSchedules,
                Classes.class_name.label("class_name"),
                Classes.class_code.label("class_code"),
                Classes.id.label("class_id"),
                Teachers.name.label("teacher_name"),
                Teachers.email.label("teacher_email"),
                Teachers.phone.label("teacher_phone"),
                Teachers.id.label("teacher_id"),
                Rooms.id.label("room_id"),
                Rooms.room_number.label("room_number"),
                Subjects.id.label("subject_id"),
                Subjects.name.label("subject_name"),
            )
            .join(
                LearningSchedules,
                LearningSchedules.id == TeachingSchedules.learning_schedule_id,
            )
            .join(Classes, Classes.id == LearningSchedules.class_id)
            .join(Subjects, Subjects.id == LearningSchedules.subject_id)
            .outerjoin(Teachers, Teachers.id == TeachingSchedules.teacher_id)
            .outerjoin(Rooms, Rooms.id == LearningSchedules.room_id)
        )

        conditions = []
        if query.status:
            conditions.append(TeachingSchedules.status == query.status)

        if query.class_id:
            conditions.append(LearningSchedules.class_id == query.class_id)

        if query.teacher_id:
            conditions.append(TeachingSchedules.teacher_id == query.teacher_id)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    Classes.class_code.ilike(search_pattern),
                    Classes.class_name.ilike(search_pattern),
                    Teachers.name.ilike(search_pattern),
                    Teachers.email.ilike(search_pattern),
                    Teachers.phone.ilike(search_pattern),
                    Subjects.subject_code.ilike(search_pattern),
                    Subjects.name.ilike(search_pattern),
                    cast(Rooms.room_number, String).ilike(search_pattern),
                )
            )

        if conditions:
            statement = statement.where(and_(*conditions))

        count_stmt = (
            select(func.count())
            .select_from(TeachingSchedules)
            .join(
                LearningSchedules,
                LearningSchedules.id == TeachingSchedules.learning_schedule_id,
            )
            .join(Classes, Classes.id == LearningSchedules.class_id)
            .join(Subjects, Subjects.id == LearningSchedules.subject_id)
            .outerjoin(Teachers, Teachers.id == TeachingSchedules.teacher_id)
            .outerjoin(Rooms, Rooms.id == LearningSchedules.room_id)
        )
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total = session.exec(count_stmt).one()

        paged_statement = (
            statement.order_by(desc(TeachingSchedules.created_at))
            .offset(query.skip)
            .limit(query.limit)
        )

        rows = session.exec(paged_statement).all()

        schedules: List[TeachingScheduleResponse] = []
        for (
            teaching_schedule,
            learning_schedule,
            class_name,
            class_code,
            class_id,
            teacher_name,
            teacher_email,
            teacher_phone,
            teacher_id,
            room_id,
            room_number,
            subject_id,
            subject_name,
        ) in rows:
            schedules.append(
                TeachingScheduleResponse(
                    id=teaching_schedule.id,
                    status=teaching_schedule.status,
                    created_at=teaching_schedule.created_at,
                    updated_at=teaching_schedule.updated_at,
                    learning_schedule=LearningSchedulePublic.model_validate(
                        learning_schedule
                    ),
                    class_info=TeachingScheduleClassInfo(
                        class_id=class_id,
                        class_name=class_name,
                        class_code=class_code,
                    ),
                    teacher=(
                        TeachingScheduleTeacherInfo(
                            teacher_id=teacher_id,
                            teacher_name=teacher_name,
                            teacher_email=teacher_email,
                            teacher_phone=teacher_phone,
                        )
                        if teacher_id is not None
                        else None
                    ),
                    room=(
                        TeachingScheduleRoomInfo(
                            room_id=room_id,
                            room_number=room_number,
                        )
                        if room_id is not None
                        else None
                    ),
                    subject=TeachingScheduleSubjectInfo(
                        subject_id=subject_id,
                        subject_name=subject_name,
                    ),
                )
            )

        return schedules, total

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
        teaching_schedule = session.get(TeachingSchedules, teaching_schedule_id)
        if not teaching_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teaching Schedule not found",
            )

        update_data = teaching_schedules_data.model_dump(exclude_unset=True)
        learning_schedule_payload = update_data.pop("learning_schedule", None)

        if "teacher_id" in update_data:
            teacher_id = update_data["teacher_id"]
            if teacher_id is not None:
                teacher = session.get(Teachers, teacher_id)
                if not teacher:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Teacher does not exist.",
                    )
            teaching_schedule.teacher_id = teacher_id

        if "status" in update_data:
            teaching_schedule.status = update_data["status"]

        if learning_schedule_payload is not None:
            learning_schedule = session.get(
                LearningSchedules, teaching_schedule.learning_schedule_id
            )
            if not learning_schedule:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Learning Schedule not found",
                )

            class_id = learning_schedule_payload.get("class_id")
            if class_id is not None and not session.get(Classes, class_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Class does not exist.",
                )

            subject_id = learning_schedule_payload.get("subject_id")
            if subject_id is not None and not session.get(Subjects, subject_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Subject does not exist.",
                )

            room_id = learning_schedule_payload.get("room_id")
            if room_id is not None and not session.get(Rooms, room_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Room does not exist.",
                )

            start_period = learning_schedule_payload.get(
                "start_period", learning_schedule.start_period
            )
            end_period = learning_schedule_payload.get(
                "end_period", learning_schedule.end_period
            )
            if start_period is not None and end_period is not None and end_period < start_period:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="end_period must be greater than or equal to start_period.",
                )

            for field, value in learning_schedule_payload.items():
                setattr(learning_schedule, field, value)
            learning_schedule.updated_at = datetime.now()

        teaching_schedule.updated_at = datetime.now()

        session.commit()
        session.refresh(teaching_schedule)

        return TeachingSchedulPublic.model_validate(teaching_schedule)

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

        learning_schedule = None
        if teaching_schedule.learning_schedule_id:
            learning_schedule = session.get(
                LearningSchedules, teaching_schedule.learning_schedule_id
            )

        if teaching_schedule.status == StatusEnum.ACTIVE:
            teaching_schedule.status = StatusEnum.INACTIVE
            if learning_schedule and learning_schedule.status == StatusEnum.ACTIVE:
                learning_schedule.status = StatusEnum.INACTIVE
            session.commit()
            return TeachingScheduleDeleteResponse(
                id=str(teaching_schedule.id),
                message="Teaching Schedule and related Learning Schedule set to inactive",
            )

        session.delete(teaching_schedule)

        if learning_schedule:
            has_other_teaching_schedule = session.exec(
                select(TeachingSchedules.id).where(
                    TeachingSchedules.learning_schedule_id == learning_schedule.id,
                    TeachingSchedules.id != teaching_schedule_id,
                )
            ).first()

            if not has_other_teaching_schedule:
                session.delete(learning_schedule)

        session.commit()

        return TeachingScheduleDeleteResponse(
            id=str(teaching_schedule.id),
            message="Teaching Schedule and related Learning Schedule deleted successfully",
        )
