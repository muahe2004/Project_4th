import uuid

from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List
from sqlalchemy.orm import aliased
from sqlalchemy import String, cast, func

from app.enums.status import StatusEnum
from app.models.models import (
    ExaminationSchedules,
    Classes,
    Subjects,
    Rooms,
    Teachers,
    StudentClass,
)
from app.models.schemas.examination_schedules.examination_schedule_schemas import (
    ExaminationSchedulePublic,
    ExaminationScheduleCreate,
    ExaminationScheduleUpdate,
    ExaminationScheduleDeleteResponse,
    ExaminationScheduleResponse,
    ExaminationScheduleClassInfo,
    ExaminationScheduleSubjectInfo,
    ExaminationScheduleRoomInfo,
    ExaminationScheduleInvigilatorInfo,
    ExaminationScheduleQueryParams,
)
from app.models.schemas.common.query import DateRange
from app.services.common import build_date_conditions_for_column


class ExaminationScheduleServices:
    @staticmethod
    def _build_response(
        *,
        row: dict,
    ) -> ExaminationScheduleResponse:
        invigilator_map: dict[str, ExaminationScheduleInvigilatorInfo] = {}

        for invigilator_id_key, code_key, name_key, email_key, phone_key in (
            (
                "invigilator_1_id",
                "invigilator_1_code",
                "invigilator_1_name",
                "invigilator_1_email",
                "invigilator_1_phone_number",
            ),
            (
                "invigilator_2_id",
                "invigilator_2_code",
                "invigilator_2_name",
                "invigilator_2_email",
                "invigilator_2_phone_number",
            ),
        ):
            invigilator_id = row.get(invigilator_id_key)
            if not invigilator_id:
                continue

            invigilator_map[str(invigilator_id)] = ExaminationScheduleInvigilatorInfo(
                invigilator_id=invigilator_id,
                invigilator_code=row.get(code_key),
                invigilator_name=row.get(name_key),
                invigilator_email=row.get(email_key),
                invigilator_phone_number=row.get(phone_key),
            )

        class_info = (
            ExaminationScheduleClassInfo(
                class_id=row["class_id"],
                class_code=row.get("class_code"),
                class_name=row.get("class_name"),
            )
            if row.get("class_id")
            else None
        )
        subject_info = (
            ExaminationScheduleSubjectInfo(
                subject_id=row["subject_id"],
                subject_code=row.get("subject_code"),
                subject_name=row.get("subject_name"),
            )
            if row.get("subject_id")
            else None
        )
        room_info = (
            ExaminationScheduleRoomInfo(
                room_id=row["room_id"],
                room_number=row.get("room_number"),
            )
            if row.get("room_id")
            else None
        )

        return ExaminationScheduleResponse(
            id=row["id"],
            date=row["date"],
            start_time=row["start_time"],
            end_time=row["end_time"],
            status=row.get("status"),
            schedule_type=row.get("schedule_type"),
            class_info=class_info,
            subject_info=subject_info,
            room_info=room_info,
            invigilator=list(invigilator_map.values()),
        )

    @staticmethod
    def _build_query_statement(
        *, query: ExaminationScheduleQueryParams, date_range: DateRange
    ):
        teacher_one = aliased(Teachers)
        teacher_two = aliased(Teachers)
        student_class_subquery = None

        if query.student_id:
            student_class_subquery = (
                select(StudentClass.class_id)
                .where(
                    StudentClass.student_id == query.student_id,
                    (
                        (StudentClass.status == StatusEnum.ACTIVE)
                        | (StudentClass.status.is_(None))
                    ),
                )
                .distinct()
                .subquery()
            )

        statement = (
            select(
                ExaminationSchedules.id.label("id"),
                ExaminationSchedules.date.label("date"),
                ExaminationSchedules.start_time.label("start_time"),
                ExaminationSchedules.end_time.label("end_time"),
                ExaminationSchedules.status.label("status"),
                ExaminationSchedules.schedule_type.label("schedule_type"),
                Classes.id.label("class_id"),
                Classes.class_code.label("class_code"),
                Classes.class_name.label("class_name"),
                Subjects.id.label("subject_id"),
                Subjects.subject_code.label("subject_code"),
                Subjects.name.label("subject_name"),
                Rooms.id.label("room_id"),
                Rooms.room_number.label("room_number"),
                teacher_one.id.label("invigilator_1_id"),
                teacher_one.teacher_code.label("invigilator_1_code"),
                teacher_one.name.label("invigilator_1_name"),
                teacher_one.email.label("invigilator_1_email"),
                teacher_one.phone.label("invigilator_1_phone_number"),
                teacher_two.id.label("invigilator_2_id"),
                teacher_two.teacher_code.label("invigilator_2_code"),
                teacher_two.name.label("invigilator_2_name"),
                teacher_two.email.label("invigilator_2_email"),
                teacher_two.phone.label("invigilator_2_phone_number"),
            )
            .select_from(ExaminationSchedules)
            .join(Classes, Classes.id == ExaminationSchedules.class_id)
            .join(Subjects, Subjects.id == ExaminationSchedules.subject_id)
            .outerjoin(Rooms, Rooms.id == ExaminationSchedules.room_id)
            .outerjoin(teacher_one, teacher_one.id == ExaminationSchedules.invigilator_1_id)
            .outerjoin(teacher_two, teacher_two.id == ExaminationSchedules.invigilator_2_id)
        )

        if student_class_subquery is not None:
            statement = statement.join(
                student_class_subquery,
                student_class_subquery.c.class_id == ExaminationSchedules.class_id,
            )

        conditions = []

        if query.status:
            conditions.append(ExaminationSchedules.status == query.status)

        if query.subject_id:
            conditions.append(ExaminationSchedules.subject_id == query.subject_id)

        if query.class_id:
            conditions.append(ExaminationSchedules.class_id == query.class_id)

        if query.invigilator_id:
            conditions.append(
                (
                    ExaminationSchedules.invigilator_1_id == query.invigilator_id
                )
                | (
                    ExaminationSchedules.invigilator_2_id == query.invigilator_id
                )
            )

        conditions.extend(
            build_date_conditions_for_column(date_range, ExaminationSchedules.date)
        )

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                (
                    cast(Rooms.room_number, String).ilike(search_pattern)
                    | Subjects.subject_code.ilike(search_pattern)
                    | Subjects.name.ilike(search_pattern)
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        return statement, conditions

    @staticmethod
    def get_all(
        *, session: Session, query: ExaminationScheduleQueryParams, date_range: DateRange
    ) -> tuple[list[ExaminationScheduleResponse], int]:
        statement, conditions = ExaminationScheduleServices._build_query_statement(
            query=query, date_range=date_range
        )
        student_class_subquery = None
        if query.student_id:
            student_class_subquery = (
                select(StudentClass.class_id)
                .where(
                    StudentClass.student_id == query.student_id,
                    (
                        (StudentClass.status == StatusEnum.ACTIVE)
                        | (StudentClass.status.is_(None))
                    ),
                )
                .distinct()
                .subquery()
            )

        count_stmt = (
            select(func.count())
            .select_from(ExaminationSchedules)
            .join(Classes, Classes.id == ExaminationSchedules.class_id)
            .join(Subjects, Subjects.id == ExaminationSchedules.subject_id)
            .outerjoin(Rooms, Rooms.id == ExaminationSchedules.room_id)
        )
        if student_class_subquery is not None:
            count_stmt = count_stmt.join(
                student_class_subquery,
                student_class_subquery.c.class_id == ExaminationSchedules.class_id,
            )
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total = session.exec(count_stmt).one()

        statement = statement.order_by(
            ExaminationSchedules.date.desc(),
            ExaminationSchedules.created_at.desc(),
        ).offset(query.skip).limit(query.limit)

        rows = session.exec(statement).all()
        examination_schedules = [
            ExaminationScheduleServices._build_response(row=row._asdict())
            for row in rows
        ]
        return examination_schedules, total

    @staticmethod
    def get_by_id(
        *, session: Session, examination_schedules_id: uuid.UUID, request: Request
    ) -> ExaminationScheduleResponse:
        teacher_one = aliased(Teachers)
        teacher_two = aliased(Teachers)
        row = session.exec(
            select(
                ExaminationSchedules.id.label("id"),
                ExaminationSchedules.date.label("date"),
                ExaminationSchedules.start_time.label("start_time"),
                ExaminationSchedules.end_time.label("end_time"),
                ExaminationSchedules.status.label("status"),
                ExaminationSchedules.schedule_type.label("schedule_type"),
                Classes.id.label("class_id"),
                Classes.class_code.label("class_code"),
                Classes.class_name.label("class_name"),
                Subjects.id.label("subject_id"),
                Subjects.subject_code.label("subject_code"),
                Subjects.name.label("subject_name"),
                Rooms.id.label("room_id"),
                Rooms.room_number.label("room_number"),
                teacher_one.id.label("invigilator_1_id"),
                teacher_one.teacher_code.label("invigilator_1_code"),
                teacher_one.name.label("invigilator_1_name"),
                teacher_one.email.label("invigilator_1_email"),
                teacher_one.phone.label("invigilator_1_phone_number"),
                teacher_two.id.label("invigilator_2_id"),
                teacher_two.teacher_code.label("invigilator_2_code"),
                teacher_two.name.label("invigilator_2_name"),
                teacher_two.email.label("invigilator_2_email"),
                teacher_two.phone.label("invigilator_2_phone_number"),
            )
            .select_from(ExaminationSchedules)
            .join(Classes, Classes.id == ExaminationSchedules.class_id)
            .join(Subjects, Subjects.id == ExaminationSchedules.subject_id)
            .outerjoin(Rooms, Rooms.id == ExaminationSchedules.room_id)
            .outerjoin(teacher_one, teacher_one.id == ExaminationSchedules.invigilator_1_id)
            .outerjoin(teacher_two, teacher_two.id == ExaminationSchedules.invigilator_2_id)
            .where(ExaminationSchedules.id == examination_schedules_id)
        ).first()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Examination Schedules does not exist",
            )
        return ExaminationScheduleServices._build_response(row=row._asdict())

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

        if examination_schedule.status != StatusEnum.INACTIVE:
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
