import uuid
from datetime import datetime
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Subjects
from app.models.schemas.subjects.subject_schemas import (
    SubjectPublic,
    SubjectCreate,
    SubjectUpdate,
    SubjectDeleteResponse
)
from app.enums.status import StatusEnum
# from app.models.models import LearningSchedules
# from app.models.models import ExaminationSchedules

class SubjectServices:
    @staticmethod
    def get_all(
        *,
        session: Session,
    ) -> List[SubjectPublic]:
        subjects = session.exec(select(Subjects)).all()
        return subjects
    
    @staticmethod
    def get_by_id(
        *,
        session: Session,
        subject_id: uuid.UUID,
        request: Request
    ) -> SubjectPublic:
        subject = session.get(Subjects, subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject does not exist"
            )
        return SubjectPublic.model_validate(subject)
    
    @staticmethod
    def create(
        *,
        session: Session,
        subject: SubjectCreate
    ) -> SubjectPublic:
        existing = session.exec(
            select(Subjects).where(Subjects.name == subject.name)
        ).first()

        if (existing):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Room {subject.name} already exists.",
            )
        
        new_subject = Subjects(**subject.dict())
        session.add(new_subject)
        session.commit()
        session.refresh(new_subject)

        return new_subject
    
    @staticmethod
    def update(
        *,
        session: Session,
        subject_id: uuid.UUID,
        subject_data: SubjectUpdate
    ) -> SubjectPublic:
        subject = session.get(Subjects, subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
            )
        
        update_data = subject_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(subject, field, value)

        session.commit()
        
        return SubjectPublic.model_validate(subject)
    
    @staticmethod
    def delete(
        *,
        session: Session,
        subject_id: uuid.UUID
    ) -> SubjectDeleteResponse:
        subject = session.get(Subjects, subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
            )
        
        # todo: check related 


        # add status to subject
        # if subject.status == StatusEnum.ACTIVE:
        #     subject.status = StatusEnum.INACTIVE
        #     session.commit()
        #     return SubjectDeleteResponse(id=str(subject.id), message="subject set to inactive")
        
        session.delete(subject)
        session.commit()
        return SubjectDeleteResponse(id=str(subject.id), message="subject deleted successfully")