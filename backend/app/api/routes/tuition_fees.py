import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.tuition_fees.tuition_fee_schemas import (
    TuitionFeePublic,
    TuitionFeePublicDetail,
    TuitionFeeListResponse,
    TuitionFeeQueryParams,
    TuitionFeeCreate,
    TuitionFeeUpdate,
    TuitionFeeDeleteResponse,
)
from app.services.tuition_fees import TuitionFeeServices
from typing import List

router = APIRouter()


# =========================== get all tuition fees ===========================
@router.get("", response_model=TuitionFeeListResponse)
def get_tuition_fees(
    session: SessionDep, query: TuitionFeeQueryParams = Depends()
) -> TuitionFeeListResponse:
    return TuitionFeeServices.get_all(session=session, query=query)


# =========================== get tuition fee by id ===========================
@router.get("/{id}", response_model=TuitionFeePublicDetail)
def get_tuition_fee_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> TuitionFeePublicDetail:
    return TuitionFeeServices.get_by_id(
        session=session, tuition_fee_id=id, request=request
    )


# =========================== add tuition fee ===========================
@router.post(
    "",
    response_model=List[TuitionFeePublic],
)
def create_tuition_fees(
    request: Request, session: SessionDep, data: List[TuitionFeeCreate]
) -> List[TuitionFeePublic]:
    return TuitionFeeServices.create_many(session=session, tuition_fees=data)


# =========================== update tuition fee ===========================
@router.patch(
    "/{id}",
    response_model=TuitionFeePublic,
)
def update_tuition_fee(
    session: SessionDep, id: uuid.UUID, data: TuitionFeeUpdate
) -> TuitionFeePublic:
    return TuitionFeeServices.update(
        session=session, tuition_fee_id=id, tuition_fee_data=data
    )


# =========================== delete tuition fee ===========================
@router.delete(
    "/{id}",
    response_model=TuitionFeeDeleteResponse,
)
def delete_tuition_fee(
    session: SessionDep, tuition_fee_id: uuid.UUID
) -> List[TuitionFeeDeleteResponse]:
    return TuitionFeeServices.delete(session=session, tuition_fee_id=tuition_fee_id)
