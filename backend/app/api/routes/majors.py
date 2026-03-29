import uuid

from fastapi import APIRouter, Depends, Request
from typing import List
from app.api.deps import SessionDep
from app.models.schemas.common.query import IdsRequest
from app.models.schemas.majors.major_schemas import (
    MajorDropDownResponse,
    MajorListResponse,
    MajorPublic,
    MajorCreate,
    MajorQueryParams,
    MajorUpdate,
    MajorDeleteResponse,
)
from app.services.majors import MajorServices

router = APIRouter()


@router.get("")
def get_majors(session: SessionDep, query: MajorQueryParams = Depends()):
    majors, total = MajorServices.get_all(session=session, query=query)
    return MajorListResponse(total=total, data=majors)


# =========================== get dropdown majors ===========================
@router.get("/dropdown", response_model=List[MajorDropDownResponse])
def get_majors_dropdown(
    session: SessionDep, query: MajorQueryParams = Depends()
) -> List[MajorDropDownResponse]:
    return MajorServices.get_dropdown(session=session, query=query)


# =========================== get dropdown majors by ids ===========================
@router.post("/dropdown-by-ids", response_model=List[MajorDropDownResponse])
def get_majors_dropdown_by_ids(
    session: SessionDep, payload: IdsRequest, request: Request
) -> List[MajorDropDownResponse]:
    return MajorServices.get_dropdown_by_ids(
        session=session,
        ids=payload.ids,
        request=request,
    )


# =========================== get major by id ===========================
@router.get("/{id}", response_model=MajorPublic)
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
    return MajorServices.create(session=session, major=data)


# =========================== update major ===========================
@router.patch(
    "/{id}",
    response_model=MajorPublic,
)
def update_major(session: SessionDep, id: uuid.UUID, data: MajorUpdate) -> MajorPublic:
    return MajorServices.update(session=session, major_id=id, major_data=data)


# # =========================== delete major ===========================
@router.delete(
    "/{id}",
    response_model=MajorDeleteResponse,
)
def delete_major(session: SessionDep, id: uuid.UUID) -> MajorDeleteResponse:
    return MajorServices.delete(session=session, major_id=id)
