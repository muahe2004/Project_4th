import uuid
from fastapi import APIRouter, Request
from app.api.deps import SessionDep
from app.models.schemas.relatives.relative_schemas import (
    RelativePublic,
    RelativeCreate,
    RelativeUpdate,
    RelativeDeleteResponse,
)
from app.services.relatives import RelativeServices
from typing import List

router = APIRouter()


# =========================== get all relative ===========================
@router.get("", response_model=List[RelativePublic])
def get_relatives(session: SessionDep) -> List[RelativePublic]:
    return RelativeServices.get_all(session=session)


# =========================== get relative by id ===========================
@router.get("/{id}", response_model=RelativePublic)
def get_relatives_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> RelativePublic:
    return RelativeServices.get_by_id(session=session, relative_id=id, request=request)


# =========================== create relative ===========================
@router.post(
    "",
    response_model=RelativePublic,
)
def create_relative(
    request: Request, session: SessionDep, data: RelativeCreate
) -> RelativePublic:
    return RelativeServices.create(session=session, relative=data)


# =========================== update relative ===========================
@router.patch(
    "/{id}",
    response_model=RelativePublic,
)
def update_relative(
    session: SessionDep, id: uuid.UUID, data: RelativeUpdate
) -> RelativePublic:
    return RelativeServices.update(session=session, relative_id=id, relative_data=data)


# =========================== delete relative ===========================
@router.delete(
    "/{id}",
    response_model=RelativeDeleteResponse,
)
def delete_relative(session: SessionDep, id: uuid.UUID) -> RelativeDeleteResponse:
    return RelativeServices.delete(session=session, relative_id=id)
