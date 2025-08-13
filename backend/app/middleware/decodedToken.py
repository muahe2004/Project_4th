import jwt
from fastapi import Request, HTTPException, status
from jwt import PyJWTError
from app.core.config import settings

UNICORE_SECRET_KEY = settings.UNICORE_SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def decode_jwt(token: str):
    try:
        payload = jwt.decode(token, UNICORE_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token!",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not found in cookies!",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


