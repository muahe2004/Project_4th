import uuid

from app.models.schemas.classes.student_class_schemas import StudentClassCreate, StudentClassPublic, StudentClassUpdate
from fastapi import APIRouter, Depends, Request, Query
from app.api.deps import SessionDep
from app.models.schemas.classes.class_schemas import (
    ClassListResponse,
    ClassPublic,
    ClassCreate,
    ClassQueryParams,
    ClassUpdate,
    ClassDeleteResponse
)
from app.services.student_class import StudentClassServices
from typing import List, Optional

router = APIRouter()

# =========================== add student class ===========================
@router.post(
    "",
    response_model=StudentClassPublic,
)
def create_student_class(
    request: Request, session: SessionDep, data: StudentClassCreate
) -> StudentClassPublic:
    return StudentClassServices.create(session=session, class_=data)

# =========================== update student class ===========================
@router.patch(
    "/{id}",
    response_model=StudentClassPublic,
)
def update_class(
    session: SessionDep, id: uuid.UUID, data: StudentClassUpdate
) -> StudentClassPublic:
    return StudentClassServices.update(session=session, student_class_id=id, student_class_data=data)