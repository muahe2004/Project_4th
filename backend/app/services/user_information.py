import uuid
from datetime import datetime
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import UserInformations
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationPublic,
    UserInformationUpdate,
    UserInformationDeleteResponse,
)

class User_Information_Services:
    @staticmethod
    def get_all(*, session: Session) -> List[UserInformationPublic]:
        userinformations = session.exec(select(UserInformations)).all()
        return userinformations
    
    @staticmethod
    def get_teacher_information_by_id(
        *,
        session: Session,
        teacher_id: uuid.UUID,
        request: Request
    ) -> UserInformationPublic:
        user_information = session.execute(
            select(UserInformations).where(UserInformations.teacher_id == teacher_id)
        ).scalar_one_or_none()
        if not user_information:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User information does not exist"
            )
    
        return UserInformationPublic.model_validate(user_information)
    
    @staticmethod
    def get_student_information_by_id(
        *,
        session: Session,
        student_id: uuid.UUID,
        request: Request
    ) -> UserInformationPublic:
        user_information = session.execute(
            select(UserInformations).where(UserInformations.student_id == student_id)
        ).scalar_one_or_none()
        if not user_information:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User information does not exist"
            )
    
        return UserInformationPublic.model_validate(user_information)

    @staticmethod
    def update(
        *,
        session: Session,
        user_information_id: uuid.UUID,
        user_information_data: UserInformationUpdate,
        commit: bool = True,
    ) -> UserInformationPublic: 
        user_information = session.get(UserInformations, user_information_id)
        if not user_information:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User information not found"
            )
        
        update_data = user_information_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user_information, field, value)

        if commit:
            session.commit()
        else:
            session.flush()
        return UserInformationPublic.model_validate(user_information)
    
    @staticmethod 
    def delete(
        *,
        session: Session,
        user_information_id: uuid.UUID
    ) -> UserInformationDeleteResponse:
        user_information = session.get(UserInformations, user_information_id)
        if not user_information:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND, detail="User information not found"
            )
        
        session.delete(user_information)
        session.commit()

        return UserInformationDeleteResponse(id = str(user_information.id), message = "UserInformation deleted successfully")