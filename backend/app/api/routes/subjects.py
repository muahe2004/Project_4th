import uuid
from app.models.schemas.common.query import BaseQueryParams, IdsRequest
from fastapi import APIRouter, Request, Depends
from app.api.deps import SessionDep
from app.models.schemas.subjects.subject_schemas import (
    SubjectListResponse,
    SubjectPublic,
    SubjectCreate,
    SubjectUpdate,
    SubjectDeleteResponse,
    SubjectDropdownResponse,
)
from app.services.subjects import SubjectServices
from typing import List

router = APIRouter()


# =========================== get all subject ===========================
@router.get("")
def get_departments(session: SessionDep, query: BaseQueryParams = Depends()):
    departments, total = SubjectServices.get_all(session=session, query=query)
    return SubjectListResponse(total=total, data=departments)


# =========================== get dropdown subjects ===========================
@router.get("/dropdown", response_model=List[SubjectDropdownResponse])
def get_subjects_dropdown(
    session: SessionDep, query: BaseQueryParams = Depends()
) -> List[SubjectDropdownResponse]:
    return SubjectServices.get_dropdown(session=session, query=query)


# =========================== get dropdown subjects by ids ===========================
@router.post("/dropdown-by-ids", response_model=List[SubjectDropdownResponse])
def get_subjects_dropdown_by_ids(
    session: SessionDep, payload: IdsRequest, request: Request
) -> List[SubjectDropdownResponse]:
    return SubjectServices.get_dropdown_by_ids(
        session=session,
        ids=payload.ids,
        request=request,
    )

# =========================== get subject by id ===========================
@router.get("/{id}", response_model=SubjectPublic)
def get_subject_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> SubjectPublic:
    return SubjectServices.get_by_id(session=session, subject_id=id, request=request)


# =========================== create subject ===========================
@router.post(
    "",
    response_model=SubjectPublic,
)
def create_subject(
    request: Request, session: SessionDep, data: SubjectCreate
) -> SubjectPublic:
    return SubjectServices.create(session=session, subject=data)


# =========================== update subject ===========================
@router.patch(
    "/{id}",
    response_model=SubjectPublic,
)
def update_subject(
    session: SessionDep, id: uuid.UUID, data: SubjectUpdate
) -> SubjectPublic:
    return SubjectServices.update(session=session, subject_id=id, subject_data=data)


# =========================== delete subject ===========================
@router.delete(
    "",
    response_model=List[SubjectDeleteResponse],
)
def delete_multiple_subjects(
    session: SessionDep, subject_ids: List[uuid.UUID]
) -> List[SubjectDeleteResponse]:
    return SubjectServices.delete_many(session=session, subject_ids=subject_ids)
