import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.departments.department_schemas import (
    DepartmentPublic,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentDeleteResponse
)
from app.services.departments import DepartmentServices
from typing import List

router = APIRouter()

# =========================== get all department ===========================
@router.get("", response_model=List[DepartmentPublic])
def get_departments(session: SessionDep) -> List[DepartmentPublic]:
    return DepartmentServices.get_all(session=session)

# =========================== get department by id ===========================
@router.get(
    "/{id}",
    response_model=DepartmentPublic
)
def get_department_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> DepartmentPublic:
    return DepartmentServices.get_by_id(session=session, department_id=id, request=request)

# =========================== add department ===========================
@router.post(
    "",
    response_model=DepartmentPublic,
)
def create_department(
    request: Request, session: SessionDep, data: DepartmentCreate
) -> DepartmentPublic:
    return DepartmentServices.create(session=session, department=data)

# =========================== update department ===========================
@router.patch(
    "/{id}",
    response_model=DepartmentPublic,
)
def update_department(
    session: SessionDep, id: uuid.UUID, data: DepartmentUpdate
) -> DepartmentPublic:
    return DepartmentServices.update(session=session, department_id=id, department_data=data)

# =========================== delete department ===========================
@router.delete(
    "/{id}",
    response_model=DepartmentDeleteResponse,
)
def delete_department(
    session: SessionDep, id: uuid.UUID
) -> DepartmentDeleteResponse:
    return DepartmentServices.delete(session=session, department_id=id)

