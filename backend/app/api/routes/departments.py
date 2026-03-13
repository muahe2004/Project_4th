import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.departments.department_schemas import (
    DepartmentListResponse,
    DepartmentPublic,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentDeleteResponse,
)
from app.services.departments import DepartmentServices

from app.models.schemas.common.query import BaseQueryParams

router = APIRouter()


# =========================== get all department ===========================
@router.get("")
def get_departments(session: SessionDep, query: BaseQueryParams = Depends()):
    departments, total = DepartmentServices.get_all(session=session, query=query)
    return DepartmentListResponse(total=total, data=departments)


# =========================== get department by id ===========================
@router.get("/{id}", response_model=DepartmentPublic)
def get_department_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> DepartmentPublic:
    return DepartmentServices.get_by_id(
        session=session, department_id=id, request=request
    )


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
    return DepartmentServices.update(
        session=session, department_id=id, department_data=data
    )


# =========================== delete department ===========================
@router.delete(
    "/{id}",
    response_model=DepartmentDeleteResponse,
)
def delete_department(session: SessionDep, id: uuid.UUID) -> DepartmentDeleteResponse:
    return DepartmentServices.delete(session=session, department_id=id)
