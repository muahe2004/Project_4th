import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.classes.class_schemas import (
    ClassPublic,
    ClassCreate,
    ClassUpdate,
    ClassDeleteResponse
)
from app.services.classes import ClassServices
from typing import List

router = APIRouter()

# =========================== get all classes ===========================
@router.get("", response_model=List[ClassPublic])
def get_classes(session: SessionDep) -> List[ClassPublic]:
    return ClassServices.get_all(session=session)

# =========================== get class by id ===========================
@router.get(
    "/{id}",
    response_model=ClassPublic
)
def get_class_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> ClassPublic:
    return ClassServices.get_by_id(session=session, class_id=id, request=request)

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