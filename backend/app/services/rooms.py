import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, and_, desc, or_, select
from sqlalchemy import String, cast
from starlette import status
from typing import List

from app.models.models import Rooms
from app.models.schemas.rooms.room_schemas import (
    RoomDropDownResponse,
    RoomsPublic,
    RoomCreate,
    RoomSearchParams,
    RoomUpdate,
    RoomDeleteResponse,
)
from app.enums.status import StatusEnum
from app.models.models import LearningSchedules
from app.models.models import ExaminationSchedules


class RoomServices:
    @staticmethod
    def get_all(
        *,
        session: Session,
    ) -> List[RoomsPublic]:
        rooms = session.exec(select(Rooms)).all()
        return rooms

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
