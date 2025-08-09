from typing import Optional
from sqlmodel import SQLModel

class LoginRequest(SQLModel):
    username: str
    password: str

class UserInfo(SQLModel):
    id: str
    full_name: str
    code: str
    role: str

class LoginResponse(SQLModel):
    access_token: str
    token_type: str
    user: UserInfo