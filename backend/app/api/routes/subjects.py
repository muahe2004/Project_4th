import uuid
from fastapi import APIRouter, Request
from app.api.deps import SessionDep
from app.models.schemas.subjects.subject_schemas import (
    SubjectPublic,
    SubjectCreate,
    SubjectUpdate,
    SubjectDeleteResponse,
)
from app.services.subjects import SubjectServices
from typing import List

router = APIRouter()


# =========================== get all subject ===========================
@router.get("", response_model=List[SubjectPublic])
def get_subjects(session: SessionDep) -> List[SubjectPublic]:
    return SubjectServices.get_all(session=session)


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
    "/{id}",
    response_model=SubjectDeleteResponse,
)
def delete_subject(session: SessionDep, id: uuid.UUID) -> SubjectDeleteResponse:
    return SubjectServices.delete(session=session, subject_id=id)
