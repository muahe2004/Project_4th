import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.teachers.teacher_schemas import (
    TeacherDropdownResponse,
    TeacherPublic,
    TeacherCreate,
    TeacherResponse,
    TeacherSearchParams,
    TeacherUpdate,
    TeacherDeleteResponse,
    TeacherWithCitizenID,
    TeacherCreateWithUserInfor
)
from app.services.teachers import TeacherServices
from typing import List

router = APIRouter()

# =========================== get all teacheres ===========================
@router.get("", response_model=List[TeacherPublic])
def get_teacheres(session: SessionDep) -> List[TeacherPublic]:
    return TeacherServices.get_all(session=session)

# =========================== GET LIST TEACHERS BY IDS ===========================
@router.post("/list-teacher", response_model=List[TeacherResponse])
def get_teachers_by_ids(teacher_ids: List[str], session: SessionDep) -> List[TeacherResponse]:
    teachers = TeacherServices.get_list_teacher(session=session, teacher_ids=teacher_ids)
    return [TeacherResponse.model_validate(t) for t in teachers]

# =========================== GET DROPDOWN TEACHERS ===========================
@router.get("/dropdown", response_model=List[TeacherDropdownResponse])
def get_teachers_dropdown(
    session: SessionDep,
    query: TeacherSearchParams = Depends()
) -> List[TeacherDropdownResponse]:
    return TeacherServices.get_dropdown(session=session, query=query)

# =========================== get teacher by id ===========================
@router.get(
    "/{id}",
    response_model=TeacherPublic
)
def get_teacher_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> TeacherPublic:
    return TeacherServices.get_by_id(session=session, teacher_id=id, request=request)

# =========================== add teacher ===========================
@router.post(
    "",
    response_model=TeacherWithCitizenID,
)
def create_teacher(
    request: Request, session: SessionDep, data: TeacherCreateWithUserInfor
) -> TeacherWithCitizenID:
    return TeacherServices.create(session=session, teacher=data)

# =========================== update specialization ===========================
@router.patch(
    "/{id}",
    response_model=TeacherPublic,
)
def update_teacher(
    session: SessionDep, id: uuid.UUID, data: TeacherUpdate
) -> TeacherPublic:
    return TeacherServices.update(session=session, teacher_id=id, teacher_data=data)

# =========================== delete specialization ===========================
@router.delete(
    "",
    response_model=List[TeacherDeleteResponse],
)
def delete_multiple_teachers(
    session: SessionDep, teacher_ids: List[uuid.UUID]
) -> List[TeacherDeleteResponse]:
    return TeacherServices.delete_many(session=session, teacher_ids=teacher_ids)