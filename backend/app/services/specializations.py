import uuid
from datetime import datetime

from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Specializations
from app.models.schemas.specializations.specialization_schemas import (
    SpecializationPublic,
    SpecializationCreate,
    SpecializationUpdate,
    SpecializationDeleteResponse
)
from app.models.models import Classes

from app.enums.status import StatusEnum

class SpecializationServices:
    @staticmethod
    def get_all(*, session: Session) -> List[SpecializationPublic]:
        specializations = session.exec(select(Specializations)).all()
        return specializations

    @staticmethod
    def get_by_id(
        *, session: Session, specialization_id: uuid.UUID, request: Request
    ) -> SpecializationPublic:
        specialization = session.get(Specializations, specialization_id)
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Specialization does not exist"
            )
        return SpecializationPublic.model_validate(specialization)
    
    @staticmethod
    def create(
        *,
        session: Session,
        specialization: SpecializationCreate,
    ) -> SpecializationPublic:
        existing = session.exec(
            select(Specializations).where(Specializations.name == specialization.name)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Specialization {specialization.name} already exists.",
            )
        new_specialization = Specializations(**specialization.dict())
        session.add(new_specialization)
        session.commit()
        session.refresh(new_specialization)

        return SpecializationPublic.model_validate(new_specialization)

    @staticmethod
    def create(
        *,
        session: Session,
        specialization: SpecializationCreate,
    ) -> SpecializationPublic:
        existing = session.exec(
            select(Specializations).where(Specializations.name == specialization.name)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Specialization {specialization.name} already exists.",
            )
        new_specialization = Specializations(**specialization.dict())
        session.add(new_specialization)
        session.commit()
        session.refresh(new_specialization)

        return SpecializationPublic.model_validate(new_specialization)

    @staticmethod
    def update(
        *,
        session: Session,
        specialization_id: uuid.UUID,
        specialization_data: SpecializationUpdate,
    ) -> SpecializationPublic:
        specialization = session.get(Specializations, specialization_id)
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Specialization not found"
            )

        update_data = specialization_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(specialization, field, value)

        session.commit()
        return SpecializationPublic.model_validate(specialization)
    
    @staticmethod
    def delete(
        *,
        session: Session,
        specialization_id: uuid.UUID,
    ) -> SpecializationDeleteResponse:
        specialization = session.get(Specializations, specialization_id)
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Specialization not found"
            )
        
        check_related_entities = select(Classes).where(Classes.specialization_id == specialization.id)
        classes = session.exec(check_related_entities).all()
        if classes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specialization has related classes and cannot be deleted.",
            )
        
        if specialization.status == StatusEnum.ACTIVE:
            specialization.status = StatusEnum.INACTIVE
            session.commit()
            return SpecializationDeleteResponse(id=str(specialization.id), message="Specialization set to inactive")

        session.delete(specialization)
        session.commit()
        return SpecializationDeleteResponse(id=str(specialization.id), message="Specialization deleted successfully")