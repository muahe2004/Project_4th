from fastapi import APIRouter, Depends, Response
from app.api.deps import SessionDep
from app.services.auth import AuthServices
from app.models.schemas.auth.auth_schemas import LoginRequest, LoginResponse, UserInfo

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(response: Response, session: SessionDep, data: LoginRequest):
    result_dict = AuthServices.login(
        session=session,
        username=data.username,
        password=data.password
    )
    
    access_token = result_dict["access_token"]
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 3600
    )
    
    user_info = UserInfo(**result_dict["user"])
    login_response = LoginResponse(
        access_token=result_dict["access_token"],
        token_type=result_dict["token_type"],
        user=user_info
    )
    
    return login_response

@router.get("/me")
def read_current_user(user=Depends(AuthServices.get_current_user)):
    return user

@router.post("/logout")
def logout(response: Response):
    return AuthServices.log_out(response)