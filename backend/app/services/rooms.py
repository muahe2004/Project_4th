import uuid
from app.models.schemas.learning_schedules.learning_schedule_schemas import LearningSchedulePublic
from app.models.schemas.shared.teaching_schedule_embeds import TeachingScheduleClassInfo, TeachingScheduleInRoom, TeachingScheduleSubjectInfo, TeachingScheduleTeacherInfo
from fastapi import HTTPException, Request
from sqlmodel import Session, and_, desc, or_, select, func
from sqlalchemy import String, cast
from starlette import status
from typing import List, Tuple

from app.models.models import Classes, Rooms, Subjects, Teachers, TeachingSchedules
from app.models.schemas.rooms.room_schemas import (
    RoomDropDownResponse,
    RoomWithLearningSchedules,
    RoomsPublic,
    RoomCreate,
    RoomSearchParams,
    RoomUpdate,
    RoomDeleteResponse,
)
from app.enums.status import StatusEnum
from app.models.models import LearningSchedules
from app.models.models import ExaminationSchedules
from app.models.schemas.common.query import BaseQueryParams, DateRange
from app.services.common import build_date_conditions


class RoomServices:
    @staticmethod
    def get_all(
        *,
        session: Session,
        query: BaseQueryParams,
    ) -> Tuple[List[RoomsPublic], int]:
        statement = select(Rooms)

        conditions = []
        if query.status:
            conditions.append(Rooms.status == query.status)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    cast(Rooms.room_number, String).ilike(search_pattern),
                    Rooms.type.ilike(search_pattern),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        total = session.exec(
            select(func.count()).select_from(statement.subquery())
        ).one()

        statement = (
            statement.order_by(desc(Rooms.created_at))
            .offset(query.skip)
            .limit(query.limit)
        )

        rooms = session.exec(statement).all()
        return rooms, total
    
    # get room and learning schedule
    @staticmethod
    def get_room_and_learning_schedule(
        *, session: Session, query: BaseQueryParams, date_range: DateRange
    ) -> Tuple[List[RoomWithLearningSchedules], int]:

        conditions = []
        schedule_conditions = build_date_conditions(date_range)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                cast(Rooms.room_number, String).ilike(search_pattern)
            )

        count_stmt = select(func.count(Rooms.id))

        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))

        total = session.exec(count_stmt).one()

        room_stmt = select(Rooms)

        if conditions:
            room_stmt = room_stmt.where(and_(*conditions))

        room_stmt = (
            room_stmt
            .order_by(desc(Rooms.created_at))
            .offset(query.skip)
            .limit(query.limit)
        )

        rooms = session.exec(room_stmt).all()

        if not rooms:
            return [], total

        room_ids = [r.id for r in rooms]

        stmt = (
            select(
                Rooms.id.label("room_id"),

                LearningSchedules.id.label("ls_id"),
                LearningSchedules.class_id.label("ls_class_id"),
                LearningSchedules.subject_id.label("ls_subject_id"),
                LearningSchedules.date.label("ls_date"),
                LearningSchedules.start_period.label("ls_start_period"),
                LearningSchedules.end_period.label("ls_end_period"),
                LearningSchedules.created_at.label("ls_created_at"),
                LearningSchedules.updated_at.label("ls_updated_at"),

                TeachingSchedules.id.label("ts_id"),
                TeachingSchedules.status.label("ts_status"),
                TeachingSchedules.created_at.label("ts_created_at"),
                TeachingSchedules.updated_at.label("ts_updated_at"),

                Teachers.id.label("teacher_id"),
                Teachers.name.label("teacher_name"),
                Teachers.email.label("teacher_email"),
                Teachers.phone.label("teacher_phone"),

                Classes.id.label("class_id"),
                Classes.class_name.label("class_name"),
                Classes.class_code.label("class_code"),

                Subjects.id.label("subject_id"),
                Subjects.name.label("subject_name"),
                Subjects.subject_code.label("subject_code"),
            )
            .select_from(Rooms)
            .outerjoin(LearningSchedules, LearningSchedules.room_id == Rooms.id)
            .outerjoin(
                TeachingSchedules,
                TeachingSchedules.learning_schedule_id == LearningSchedules.id,
            )
            .outerjoin(Teachers, Teachers.id == TeachingSchedules.teacher_id)
            .outerjoin(Classes, Classes.id == LearningSchedules.class_id)
            .outerjoin(Subjects, Subjects.id == LearningSchedules.subject_id)
            .where(Rooms.id.in_(room_ids))
            .order_by(desc(Rooms.created_at))
        )

        if schedule_conditions:
            stmt = stmt.where(and_(*schedule_conditions))

        rows = session.exec(stmt).all()

        room_map = {}

        for r in rooms:
            room_map[r.id] = RoomWithLearningSchedules(
                room_information=RoomsPublic.model_validate(r),
                teaching_schedules=[]
            )

        for row in rows:

            if row.ls_id is None:
                continue

            schedule_item = TeachingScheduleInRoom(
                id=row.ts_id or row.ls_id,
                status=row.ts_status,  
                created_at=row.ts_created_at or row.ls_created_at,
                updated_at=row.ts_updated_at or row.ls_updated_at,

                learning_schedule=LearningSchedulePublic(
                    id=row.ls_id,
                    class_id=row.ls_class_id,
                    subject_id=row.ls_subject_id,
                    date=row.ls_date,
                    start_period=row.ls_start_period,
                    end_period=row.ls_end_period,
                    created_at=row.ls_created_at,
                    updated_at=row.ls_updated_at,
                ),

                teacher=(
                    TeachingScheduleTeacherInfo(
                        teacher_id=row.teacher_id,
                        teacher_name=row.teacher_name,
                        teacher_email=row.teacher_email,
                        teacher_phone=row.teacher_phone,
                    )
                    if row.teacher_id else None
                ),

                class_info=(
                    TeachingScheduleClassInfo(
                        class_id=row.class_id,
                        class_name=row.class_name,
                        class_code=row.class_code,
                    )
                    if row.class_id else None
                ),

                subject=(
                    TeachingScheduleSubjectInfo(
                        subject_id=row.subject_id,
                        subject_name=row.subject_name,
                        subject_code=row.subject_code,
                    )
                    if row.subject_id else None
                ),
            )

            room_map[row.room_id].teaching_schedules.append(schedule_item)

        return list(room_map.values()), total

    @staticmethod
    def get_dropdown(
        *, session: Session, query: RoomSearchParams
    ) -> List[RoomDropDownResponse]:
        statement = select(Rooms)

        conditions = []
        if query.status:
            conditions.append(Rooms.status == query.status)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    cast(Rooms.room_number, String).ilike(search_pattern),
                    Rooms.type.ilike(search_pattern),
                )
            )

        if conditions:
            statement = statement.where(and_(*conditions))

        statement = (
            statement.order_by(desc(Rooms.created_at))
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()
        return [RoomDropDownResponse.model_validate(room) for room in results]

    @staticmethod
    def get_by_id(
        *, session: Session, room_id: uuid.UUID, request: Request
    ) -> RoomsPublic:
        room = session.get(Rooms, room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Room does not exist"
            )
        return RoomsPublic.model_validate(room)

    @staticmethod
    def create(*, session: Session, room: RoomCreate) -> RoomsPublic:
        existing = session.exec(
            select(Rooms).where(Rooms.room_number == room.room_number)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Room {room.room_number} already exists.",
            )

        new_room = Rooms(**room.dict())
        session.add(new_room)
        session.commit()
        session.refresh(new_room)

        return new_room

    @staticmethod
    def update(
        *, session: Session, room_id: uuid.UUID, room_data: RoomUpdate
    ) -> RoomsPublic:
        room = session.get(Rooms, room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Room not found"
            )

        update_data = room_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(room, field, value)

        session.commit()

        return RoomsPublic.model_validate(room)

    @staticmethod
    def delete(*, session: Session, room_id: uuid.UUID) -> RoomDeleteResponse:
        room = session.get(Rooms, room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Room not found"
            )

        check_related_entities = select(LearningSchedules).where(
            LearningSchedules.room_id == room.id
        )
        learningSchedules = session.exec(check_related_entities).all()
        if learningSchedules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room has related LearningSchedules and cannot be deleted.",
            )

        check_related_entities_second = select(ExaminationSchedules).where(
            ExaminationSchedules.room_id == room.id
        )
        examinationSchedules = session.exec(check_related_entities_second).all()
        if examinationSchedules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room has related ExaminationSchedules and cannot be deleted.",
            )

        if room.status == StatusEnum.ACTIVE:
            room.status = StatusEnum.INACTIVE
            session.commit()
            return RoomDeleteResponse(id=str(room.id), message="Room set to inactive")

        session.delete(room)
        session.commit()
        return RoomDeleteResponse(id=str(room.id), message="Room deleted successfully")
