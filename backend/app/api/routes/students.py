import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.students.student_schemas import (
    StudentPublic,
    StudentCreate,
    StudentUpdate,
    StudentDeleteResponse
)
from app.services.students import StudentServices
from typing import List

router = APIRouter()

# =========================== get all students ===========================
@router.get("", response_model = List[StudentPublic])
def get_students(session: SessionDep) -> List[StudentPublic]:
    return StudentServices.get_all(session=session)

# =========================== get student by id ===========================
@router.get(
    "/{id}",
    response_model = StudentPublic 
)
def get_student_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> StudentPublic:
    return StudentServices.get_by_id(session=session, student_id=id, request=request)

# =========================== add student ===========================
@router.post(
    "",
    response_model = StudentPublic
) 
def create_student(
    request: Request, session: SessionDep, data: StudentCreate
) -> StudentPublic:
    return StudentServices.create(session=session, student=data)

# =========================== update student ===========================
@router.patch(
    "/{id}",
    response_model=StudentPublic,
)
def update_student(
    session: SessionDep, id: uuid.UUID, data: StudentUpdate
) -> StudentPublic:
    return StudentServices.update(session=session, student_id=id, student_data=data)

# =========================== delete students ===========================
@router.delete(
    "",
    response_model=List[StudentDeleteResponse],
)
def delete_multiple_studentes(
    session: SessionDep, student_ids: List[uuid.UUID]
) -> List[StudentDeleteResponse]:
    return StudentServices.delete_many(session=session, student_ids=student_ids)