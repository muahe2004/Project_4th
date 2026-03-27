import uuid
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.rooms.room_schemas import (
    RoomDropDownResponse,
    RoomListResponse,
    RoomWithLearningSchedulesResponse,
    RoomsPublic,
    RoomCreate,
    RoomSearchParams,
    RoomUpdate,
    RoomDeleteResponse,
)
from app.services.rooms import RoomServices
from typing import List
from app.models.schemas.common.query import BaseQueryParams, DateRange

router = APIRouter()


# =========================== get all room ===========================
@router.get("", response_model=RoomListResponse)
def get_rooms(session: SessionDep, query: BaseQueryParams = Depends()):
    rooms, total = RoomServices.get_all(session=session, query=query)
    return RoomListResponse(total=total, data=rooms)


# =========================== get dropdown rooms ===========================
@router.get("/dropdown", response_model=List[RoomDropDownResponse])
def get_rooms_dropdown(
    session: SessionDep, query: RoomSearchParams = Depends()
) -> List[RoomDropDownResponse]:
    return RoomServices.get_dropdown(session=session, query=query)

# ===========================  ===========================
@router.get(
    "/with-learning-schedules",
    response_model=RoomWithLearningSchedulesResponse,
)
def get_rooms_with_learning_schedules(
    session: SessionDep,
    query: BaseQueryParams = Depends(),
    date_range: DateRange = Depends(),
):
    data, total = RoomServices.get_room_and_learning_schedule(
        session=session,
        query=query,
        date_range=date_range,
    )

    return RoomWithLearningSchedulesResponse(
        data=data,
        total=total
    )

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


@router.delete(
    "/{id}",
    response_model=RoomDeleteResponse,
)
def delete_room(session: SessionDep, id: uuid.UUID) -> RoomDeleteResponse:
    return RoomServices.delete(session=session, room_id=id)
