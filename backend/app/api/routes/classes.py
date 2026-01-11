import uuid

from app.models.schemas.classes.student_class_schemas import StudentClassCreate, StudentClassPublic
from fastapi import APIRouter, Depends, Request, Query
from app.api.deps import SessionDep
from app.models.schemas.classes.class_schemas import (
    ClassDropDownResponse,
    ClassListResponse,
    ClassPublic,
    ClassCreate,
    ClassQueryParams,
    ClassUpdate,
    ClassDeleteResponse,
    IdsRequest
)
from app.services.classes import ClassServices
from typing import List, Optional

router = APIRouter()

# =========================== get all classes ===========================
@router.get("")
def get_classes(session: SessionDep, query: ClassQueryParams = Depends()):
    classes, total = ClassServices.get_all(session=session,query=query)
    return ClassListResponse(total=total, data=classes)

# =========================== get class by id ===========================
@router.get(
    "/{id}",
    response_model=ClassPublic
)
def get_class_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> ClassPublic:
    return ClassServices.get_by_id(session=session, class_id=id, request=request)

# =========================== get dropdown class by ids ===========================
@router.post(
    "/dropdown-by-ids",
    response_model=list[ClassDropDownResponse]
)
def get_class_dropdown_by_ids( session: SessionDep, payload: IdsRequest, request: Request):
    return ClassServices.get_dropdown_by_ids(session=session, ids=payload.ids, request=request,)

# =========================== add class ===========================
@router.post(
    "",
    response_model=ClassPublic,
)
def create_class(
    request: Request, session: SessionDep, data: ClassCreate
) -> ClassPublic:
    return ClassServices.create(session=session, class_=data)

# =========================== update class ===========================
@router.patch(
    "/{id}",
    response_model=ClassPublic,
)
def update_class(
    session: SessionDep, id: uuid.UUID, data: ClassUpdate
) -> ClassPublic:
    return ClassServices.update(session=session, class_id=id, class_data=data)

# =========================== delete classes ===========================
@router.delete(
    "",
    response_model=List[ClassDeleteResponse],
)
def delete_multiple_classes(
    session: SessionDep, class_ids: List[uuid.UUID]
) -> List[ClassDeleteResponse]:
    return ClassServices.delete_many(session=session, class_ids=class_ids)

# =========================== student class ===========================
@router.post(
    "",
    response_model=StudentClassPublic,
)
def create_class(
    request: Request, session: SessionDep, data: StudentClassCreate
) -> StudentClassPublic:
    return ClassServices.create(session=session, class_=data)