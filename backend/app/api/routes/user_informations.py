import uuid

from fastapi import APIRouter, Request
from app.api.deps import SessionDep
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationPublic,
    UserInformationUpdate,
    UserInformationDeleteResponse,
)
from app.services.user_information import User_Information_Services
from typing import List

router = APIRouter()


# =========================== get all user information ===========================
@router.get("", response_model=List[UserInformationPublic])
def get_all_user_information(session: SessionDep) -> List[UserInformationPublic]:
    return User_Information_Services.get_all(session=session)


# =========================== get user information by user id ===========================
@router.get("/teacher/{teacher_id}", response_model=UserInformationPublic)
def get_teacher_information_by_id(
    session: SessionDep, teacher_id: uuid.UUID, request: Request
) -> UserInformationPublic:
    return User_Information_Services.get_teacher_information_by_id(
        session=session, teacher_id=teacher_id, request=request
    )


# =========================== get user information by user id ===========================
@router.get("/student/{student_id}", response_model=UserInformationPublic)
def get_student_information_by_id(
    session: SessionDep, student_id: uuid.UUID, request: Request
) -> UserInformationPublic:
    return User_Information_Services.get_student_information_by_id(
        session=session, student_id=student_id, request=request
    )


# =========================== update user information ===========================
@router.patch(
    "/{id}",
    response_model=UserInformationPublic,
)
def update_student(
    session: SessionDep, id: uuid.UUID, data: UserInformationUpdate
) -> UserInformationPublic:
    return User_Information_Services.update(
        session=session, user_information_id=id, user_information_data=data
    )


# =========================== delete user information ===========================
@router.delete(
    "/{id}",
    response_model=UserInformationDeleteResponse,
)
def delete_user_information(
    session: SessionDep, user_information_id: uuid.UUID
) -> List[UserInformationDeleteResponse]:
    return User_Information_Services.delete(
        session=session, user_information_id=user_information_id
    )
