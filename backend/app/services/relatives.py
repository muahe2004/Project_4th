import uuid
from datetime import datetime
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Relatives
from app.models.schemas.relatives.relative_schemas import (
    RelativePublic,
    RelativeCreate,
    RelativeUpdate,
    RelativeDeleteResponse
)

class RelativeServices:
    @staticmethod
    def get_all(
        *,
        session: Session
    ) -> List[RelativePublic]:
        relatives = session.exec(select(Relatives)).all()
        return relatives

    @staticmethod
    def get_by_id(
        *,
        session: Session,
        relative_id: uuid.UUID,
        request: Request
    ) -> RelativePublic:
        relative = session.get(Relatives, relative_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Relative does not exist"
            )
        return RelativePublic.model_validate(relative)

    @staticmethod
    def create(
        *,
        session: Session,
        relative: RelativeCreate
    ) -> RelativePublic:
        
        new_relative = Relatives(**relative.dict())
        session.add(new_relative)
        session.commit()
        session.refresh(new_relative)

        return new_relative
    
    @staticmethod
    def update(
        *,
        session: Session,
        relative_id: uuid.UUID,
        relative_data: RelativeUpdate
    ) -> RelativePublic:
        relative = session.get(Relatives, relative_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Relative not found"
            )
        
        update_data = relative_data.model_dump(exclude_unset = True)
        for field, value in update_data.items():
            setattr(relative, field, value)

        session.commit()

        return RelativePublic.model_validate(relative)
    

    @staticmethod
    def delete(
        *,
        session: Session,
        relative_id: uuid.UUID
    ) -> RelativeDeleteResponse:
        relative = session.get(Relatives, relative_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Relative not found"
            )
        
        session.delete(relative)
        session.commit()

        return RelativeDeleteResponse(id=str(relative.id), message="Relative deleted successfully")