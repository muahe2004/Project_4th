from fastapi import HTTPException, status, Request
from sqlmodel import Session, select
from app.models.models import Students, Teachers
from app.enums.status import StatusEnum
from app.enums.roles import RoleEnum, UserCodeTypeEnum
from app.middleware.hashing import verify_password
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from app.middleware.decodedToken import (get_token_from_header, decode_jwt)

UNICORE_SECRET_KEY = settings.UNICORE_SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

class AuthServices:
    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, UNICORE_SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def login(session: Session, username: str, password: str):
        if username.upper().startswith((UserCodeTypeEnum.STUDENT)):
            statement = select(Students).where(Students.student_code == username)
            user = session.exec(statement).first()
            role = RoleEnum.STUDENT
        elif username.upper().startswith((UserCodeTypeEnum.TEACHER)):
            statement = select(Teachers).where(Teachers.teacher_code == username)
            user = session.exec(statement).first()
            role = RoleEnum.TEACHER
        elif username.upper().startswith((UserCodeTypeEnum.ADMIN)):
            statement = select(Teachers).where(Teachers.teacher_code == username)
            user = session.exec(statement).first()
            role = RoleEnum.ADMIN
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The username or password you entered is incorrect.")

        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="The username or password you entered is incorrect.")

        if user.status == StatusEnum.INACTIVE:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="The username or password you entered is incorrect.")

        if not verify_password(password, user.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="The username or password you entered is incorrect.")

        access_token = AuthServices.create_access_token({
            "id": str(user.id),
            "name": str(user.name),
            "code": username,
            "role": role
        })

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "full_name": getattr(user, "full_name", None) or getattr(user, "name", None),
                "code": username,
                "role": role
            }
        }

    @staticmethod
    def get_current_user(request: Request):
        token = get_token_from_header(request)
        payload = decode_jwt(token)
        return {
            "id": payload.get("id"),
            "code": payload.get("code"),
            "name": payload.get("name"),
            "role": payload.get("role"),
        }