from fastapi import APIRouter, Depends

from app.api.deps import SessionDep
from app.services.auth import AuthServices
from app.models.schemas.auth.auth_schemas import (
    LoginRequest,
    LoginResponse
)

router = APIRouter()

# =========================== Login ===========================
@router.post(
    "/login",
    response_model=LoginResponse
)
def login(session: SessionDep, data: LoginRequest):
    return AuthServices.login(
        session=session,
        username=data.username,
        password=data.password
    )
