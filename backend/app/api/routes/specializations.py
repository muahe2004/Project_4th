import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.specializations.specialization_schemas import (
    SpecializationDropdownResponse,
    SpecializationListResponse,
    SpecializationPublic,
    SpecializationCreate,
    SpecializationQueryParams,
    SpecializationUpdate,
    SpecializationDeleteResponse
)
from app.services.specializations import SpecializationServices
from typing import List

router = APIRouter()

# =========================== get all specialization ===========================
@router.get("")
def get_majors(session: SessionDep, query: SpecializationQueryParams = Depends()):
    specializations, total = SpecializationServices.get_all(session=session,query=query)
    return SpecializationListResponse(total=total, data=specializations)

# =========================== get dropdown specialization ===========================
@router.get("/dropdown", response_model=List[SpecializationDropdownResponse])
def get_teachers_dropdown(
    session: SessionDep,
    query: SpecializationQueryParams = Depends()
) -> List[SpecializationDropdownResponse]:
    return SpecializationServices.get_dropdown(session=session, query=query)

# =========================== get specialization by id ===========================
@router.get(
    "/{id}",
    response_model=SpecializationPublic
)
def get_specialization_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> SpecializationPublic:
    return SpecializationServices.get_by_id(session=session, specialization_id=id, request=request)

# =========================== add specialization ===========================
@router.post(
    "",
    response_model=SpecializationPublic,
)
def create_specialization(
    request: Request, session: SessionDep, data: SpecializationCreate
) -> SpecializationPublic:
    return SpecializationServices.create(session=session, specialization=data)

# =========================== update specialization ===========================
@router.patch(
    "/{id}",
    response_model=SpecializationPublic,
)
def update_specialization(
    session: SessionDep, id: uuid.UUID, data: SpecializationUpdate
) -> SpecializationPublic:
    return SpecializationServices.update(session=session, specialization_id=id, specialization_data=data)

# =========================== delete specialization ===========================
@router.delete(
    "/{id}",
    response_model=SpecializationDeleteResponse,
)
def delete_specialization(
    session: SessionDep, id: uuid.UUID
) -> SpecializationDeleteResponse:
    return SpecializationServices.delete(session=session, specialization_id=id)

