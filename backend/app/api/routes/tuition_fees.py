import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.tuition_fees.tuition_fee_schemas import (
    TuitionFeePublic,
    TuitionFeeCreate,
    TuitionFeeUpdate,
    TuitionFeeDeleteResponse
)
from app.services.tuition_fees import TuitionFeeServices
from typing import List

router = APIRouter()

# =========================== get all tuition fees ===========================
@router.get("", response_model=List[TuitionFeePublic])
def get_tuition_fees(session: SessionDep) -> List[TuitionFeePublic]:
    return TuitionFeeServices.get_all(session=session)

# =========================== get tuition fee by id ===========================
@router.get(
    "/{id}",
    response_model=TuitionFeePublic
)
def get_tuition_fee_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> TuitionFeePublic:
    return TuitionFeeServices.get_by_id(session=session, tuition_fee_id=id, request=request)

# =========================== add tuition fee ===========================
@router.post(
    "",
    response_model=TuitionFeePublic,   
) 
def create_score(
    request: Request,
    session: SessionDep,
    data: TuitionFeeCreate
) -> TuitionFeePublic:
    return TuitionFeeServices.create(session=session, tuition_fee=data)

# =========================== update tuition fee ===========================
@router.patch(
    "/{id}",
    response_model=TuitionFeePublic,
)
def update_tuition_fee(
    session: SessionDep, id: uuid.UUID, data: TuitionFeeUpdate
) -> TuitionFeePublic:
    return TuitionFeeServices.update(session=session, tuition_fee_id=id, tuition_fee_data=data)

# =========================== delete tuition fee ===========================
@router.delete(
    "",
    response_model=TuitionFeeDeleteResponse,
)
def delete_tuition_fee(
    session: SessionDep, tuition_fee_id: uuid.UUID
) -> List[TuitionFeeDeleteResponse]:
    return TuitionFeeServices.delete(session=session, tuition_fee_id=tuition_fee_id)