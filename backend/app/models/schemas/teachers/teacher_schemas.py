from datetime import datetime
from typing import Optional
from uuid import UUID as UUID_TYPE, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.models.schemas.common.query import BaseQueryParams

class BaseModel(SQLModel):
    model_config = dict(arbitrary_types_allowed=True)

class TeacherBase(BaseModel):
    teacher_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[str] = Field(default=None, sa_column=Column(String(1), nullable=False))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    academic_rank: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    department_id: Optional[UUID_TYPE] = Field(default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    password: str = Field(sa_column=Column(String(100), nullable=False))

class TeacherPublic(TeacherBase):
    id: UUID_TYPE

class TeacherResponse(BaseModel):
    id: UUID_TYPE
    teacher_code: str
    name: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    academic_rank: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[UUID_TYPE] = None
    created_at: datetime
    updated_at: datetime


class TeacherWithCitizenID(TeacherPublic):
    citizen_id: str

class TeacherCreate(TeacherBase):
    pass

class TeacherCreateWithUserInfor(TeacherBase):
    citizen_id: str
    pass

class TeacherUpdate(BaseModel):
    teacher_code: Optional[str] = Field(default=None, sa_column=Column(String(12), nullable=True))
    name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[str] = Field(default=None, sa_column=Column(String(1), nullable=True))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    academic_rank: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    department_id: Optional[UUID_TYPE] = Field(default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TeacherDeleteResponse(BaseModel):
    message: str
    id: UUID_TYPE

class TeacherDropdownResponse(BaseModel):
    id: UUID_TYPE
    name: str

class TeacherSearchParams(BaseQueryParams):
    department_id: Optional[UUID_TYPE] = Field(None)
