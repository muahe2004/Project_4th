import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.common.query import BaseQueryParams, IdsRequest
from app.models.schemas.departments.department_schemas import (
    DepartmentDropDownResponse,
    DepartmentListResponse,
    DepartmentPublic,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentDeleteResponse,
)
from app.services.departments import DepartmentServices

from typing import List

router = APIRouter()


# =========================== get all department ===========================
@router.get("")
def get_departments(session: SessionDep, query: BaseQueryParams = Depends()):
    departments, total = DepartmentServices.get_all(session=session, query=query)
    return DepartmentListResponse(total=total, data=departments)


# =========================== get dropdown departments ===========================
@router.get("/dropdown", response_model=List[DepartmentDropDownResponse])
def get_departments_dropdown(
    session: SessionDep, query: BaseQueryParams = Depends()
) -> List[DepartmentDropDownResponse]:
    return DepartmentServices.get_dropdown(session=session, query=query)


# =========================== get dropdown departments by ids ===========================
@router.post("/dropdown-by-ids", response_model=List[DepartmentDropDownResponse])
def get_departments_dropdown_by_ids(
    session: SessionDep, payload: IdsRequest, request: Request
) -> List[DepartmentDropDownResponse]:
    return DepartmentServices.get_dropdown_by_ids(
        session=session,
        ids=payload.ids,
        request=request,
    )


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
