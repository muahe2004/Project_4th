import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.majors.major_schemas import (
    MajorPublic,
    MajorCreate,
    MajorUpdate,
    MajorDeleteResponse
)
from app.services.majors import MajorServices
from typing import List

router = APIRouter()

# =========================== get all major ===========================
@router.get("", response_model=List[MajorPublic])
def get_majors(session: SessionDep) -> List[MajorPublic]:
    return MajorServices.get_all(session=session)

# =========================== get major by id ===========================
@router.get(
    "/{id}",
    response_model=MajorPublic
)
def get_major_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> MajorPublic:
    return MajorServices.get_by_id(session=session, major_id=id, request=request)

# =========================== add major ===========================
@router.post(
    "",
    response_model=MajorPublic,
)
def create_major(
    request: Request, session: SessionDep, data: MajorCreate
) -> MajorPublic:
    return MajorServices.create(session=session, major=data
)

# =========================== update major ===========================
@router.patch(
    "/{id}",
    response_model=MajorPublic,
)
def update_major(
    session: SessionDep, id: uuid.UUID, data: MajorUpdate
) -> MajorPublic:
    return MajorServices.update(session=session, major_id=id, major_data=data)

# # =========================== delete major ===========================
@router.delete(
    "/{id}",
    response_model=MajorDeleteResponse,
) 
def delete_major(
    session: SessionDep, id: uuid.UUID
) -> MajorDeleteResponse:
    return MajorServices.delete(session=session, major_id=id)
