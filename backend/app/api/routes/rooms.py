import uuid
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.rooms.room_schemas import (
    RoomDropDownResponse,
    RoomsPublic,
    RoomCreate,
    RoomSearchParams,
    RoomUpdate,
    RoomDeleteResponse,
)
from app.services.rooms import RoomServices
from typing import List

router = APIRouter()


# =========================== get all room ===========================
@router.get("", response_model=List[RoomsPublic])
def get_rooms(session: SessionDep) -> List[RoomsPublic]:
    return RoomServices.get_all(session=session)


# =========================== get dropdown rooms ===========================
@router.get("/dropdown", response_model=List[RoomDropDownResponse])
def get_rooms_dropdown(
    session: SessionDep, query: RoomSearchParams = Depends()
) -> List[RoomDropDownResponse]:
    return RoomServices.get_dropdown(session=session, query=query)


# =========================== get room by id ===========================
@router.get("/{id}", response_model=RoomsPublic)
def get_room_by_id(session: SessionDep, id: uuid.UUID, request: Request) -> RoomsPublic:
    return RoomServices.get_by_id(session=session, room_id=id, request=request)


# =========================== create room ===========================
@router.post(
    "",
    response_model=RoomsPublic,
)
def create_room(request: Request, session: SessionDep, data: RoomCreate) -> RoomsPublic:
    return RoomServices.create(session=session, room=data)


# =========================== update room ===========================
@router.patch(
    "/{id}",
    response_model=RoomsPublic,
)
def update_room(session: SessionDep, id: uuid.UUID, data: RoomUpdate) -> RoomsPublic:
    return RoomServices.update(session=session, room_id=id, room_data=data)


# =========================== delete room ===========================
@router.delete(
    "/{id}",
    response_model=RoomDeleteResponse,
)
def delete_room(session: SessionDep, id: uuid.UUID) -> RoomDeleteResponse:
    return RoomServices.delete(session=session, room_id=id)
