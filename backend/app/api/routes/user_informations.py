import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.models import UserInformations
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationPublic,
    UserInformationCreate,
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

# =========================== update user information ===========================
@router.patch(
    "/{id}",
    response_model=UserInformationPublic,
)
def update_student(
    session: SessionDep, id: uuid.UUID, data: UserInformationUpdate
) -> UserInformationPublic:
    return User_Information_Services.update(session=session, user_information_id=id, user_information_data=data)