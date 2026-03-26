import uuid

from app.models.schemas.common.query import BaseQueryParams
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.classes.class_schemas import (
    ClassDropDownResponse,
    ClassListResponse,
    ClassPublic,
    ClassCreate,
    ClassQueryParams,
    ClassUpdate,
    ClassDeleteResponse,
    ClassWithLearningSchedulesResponse,
    IdsRequest,
)
from app.services.classes import ClassServices
from typing import List

router = APIRouter()


# =========================== get all classes ===========================
@router.get("")
def get_classes(session: SessionDep, query: ClassQueryParams = Depends()):
    classes, total = ClassServices.get_all(session=session, query=query)
    return ClassListResponse(total=total, data=classes)

# ===========================  ===========================
@router.get(
    "/with-learning-schedules",
    response_model=ClassWithLearningSchedulesResponse,
)
def get_classes_with_learning_schedules(
    session: SessionDep,
    query: BaseQueryParams = Depends()
):
    data, total = ClassServices.get_class_and_learning_schedule(
        session=session,
        query=query,
    )

    return ClassWithLearningSchedulesResponse(
        data=data,
        total=total
    )

# =========================== get dropdown class by ids ===========================
@router.post("/dropdown-by-ids", response_model=list[ClassDropDownResponse])
def get_class_dropdown_by_ids(
    session: SessionDep, payload: IdsRequest, request: Request
):
    return ClassServices.get_dropdown_by_ids(
        session=session,
        ids=payload.ids,
        request=request,
    )

# =========================== get dropdown classes ===========================
@router.get("/dropdown", response_model=List[ClassDropDownResponse])
def get_classes_dropdown(
    session: SessionDep, query: ClassQueryParams = Depends()
) -> List[ClassDropDownResponse]:
    return ClassServices.get_dropdown(session=session, query=query)


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
def update_class(session: SessionDep, id: uuid.UUID, data: ClassUpdate) -> ClassPublic:
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
