import uuid
from datetime import datetime
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import TuitionFees
from app.models.schemas.tuition_fees.tuition_fee_schemas import (
    TuitionFeePublic,
    TuitionFeeCreate,
    TuitionFeeUpdate,
    TuitionFeeDeleteResponse
)
from app.enums.status import StatusEnum

class TuitionFeeServices:
    @staticmethod
    def get_all(
        *,
        session: Session
    ) -> List[TuitionFeePublic]:
        tuition_fees = session.exec(select(TuitionFees)).all()
        return tuition_fees

    @staticmethod
    def get_by_id(
        *,
        session: Session,
        request: Request,
        tuition_fee_id: uuid.UUID
    ) -> TuitionFeePublic:
        tuition_fee = session.get(TuitionFees, tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tuition fee does not exist"
            )
        return TuitionFeePublic.model_validate(tuition_fee)

    @staticmethod
    def create(
        *,
        session: Session,
        tuition_fee: TuitionFeeCreate
    ) -> TuitionFeePublic:
        existing = session.exec(
            select(TuitionFees).where(
                TuitionFees.academic_year == tuition_fee.academic_year,
                TuitionFees.student_id == tuition_fee.student_id
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tuition fee {tuition_fee.name} already exists.",
            )
        
        new_tuition_fee = TuitionFees(**tuition_fee.dict())
        session.add(new_tuition_fee)
        session.commit()
        session.refresh(new_tuition_fee)

        return new_tuition_fee

    @staticmethod
    def update(
        *,
        session: Session,
        tuition_fee_id: uuid.UUID,
        tuition_fee_data: TuitionFeeUpdate
    ) -> TuitionFeePublic:
        tuition_fee = session.get(TuitionFees, tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tuition fee not found"
            )
        
        update_data = tuition_fee_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tuition_fee, field, value)

        session.commit()

        return TuitionFeePublic.model_validate(tuition_fee)
    
    @staticmethod
    def delete(
        *,
        session: Session,
        tuition_fee_id: uuid.UUID
    ) -> TuitionFeeDeleteResponse:
        tuition_fee = session.get(TuitionFees, tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tuition fee not found"
            )

        # check relations

        if tuition_fee.status == StatusEnum.ACTIVE:
            tuition_fee.status = StatusEnum.INACTIVE
            session.commit()
            return TuitionFeeDeleteResponse(id=str(tuition_fee.id), message="Tuition fee set to inactive")
        
        session.delete(tuition_fee)
        session.commit()
        return TuitionFeeDeleteResponse(id=str(tuition_fee.id), message="Tuition fee deleted successfully")