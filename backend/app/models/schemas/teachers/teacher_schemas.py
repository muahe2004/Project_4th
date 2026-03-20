from datetime import datetime
from typing import List, Optional
from uuid import UUID as UUID_TYPE
from app.models.schemas.relatives.relative_schemas import (
    RelativePublic,
    UserRelativeCreate,
)
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationCreate,
    UserInformationPublic,
)
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.models.schemas.common.query import BaseQueryParams


class BaseModel(SQLModel):
    model_config = dict(arbitrary_types_allowed=True)


class TeacherBase(BaseModel):
    teacher_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[str] = Field(
        default=None, sa_column=Column(String(1), nullable=False)
    )
    email: Optional[str] = Field(
        default=None, sa_column=Column(String(100), nullable=False, unique=True)
    )
    phone: Optional[str] = Field(
        default=None, sa_column=Column(String(20), nullable=True)
    )
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    academic_rank: Optional[str] = Field(
        default=None, sa_column=Column(String(100), nullable=True)
    )
    status: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    department_id: Optional[UUID_TYPE] = Field(
        default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    password: str = Field(sa_column=Column(String(100), nullable=False))


class TeacherPublic(TeacherBase):
    id: UUID_TYPE


class TeacherResponse(TeacherPublic):
    password: Optional[str] = None  # override field from parent
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    teacher_information: Optional[UserInformationPublic] = None
    teacher_relative: Optional[List[RelativePublic]] = None


class TeacherWithCitizenID(TeacherPublic):
    citizen_id: str


# need include learning schedule create 
class TeacherCreate(TeacherBase):
    pass


class TeacherCreateWithUserInfor(TeacherBase):
    teacher_information: UserInformationCreate
    teacher_relatives: List[UserRelativeCreate]


class TeacherUpdate(BaseModel):
    teacher_code: Optional[str] = Field(
        default=None, sa_column=Column(String(12), nullable=True)
    )
    name: Optional[str] = Field(
        default=None, sa_column=Column(String(100), nullable=True)
    )
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[str] = Field(
        default=None, sa_column=Column(String(1), nullable=True)
    )
    email: Optional[str] = Field(
        default=None, sa_column=Column(String(100), nullable=False, unique=True)
    )
    phone: Optional[str] = Field(
        default=None, sa_column=Column(String(20), nullable=True)
    )
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    academic_rank: Optional[str] = Field(
        default=None, sa_column=Column(String(100), nullable=True)
    )
    status: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    department_id: Optional[UUID_TYPE] = Field(
        default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    teacher_information: Optional[UserInformationCreate] = None
    teacher_relatives: Optional[List[UserRelativeCreate]] = None


class TeacherDeleteResponse(BaseModel):
    message: str
    id: UUID_TYPE


class TeacherDropdownResponse(BaseModel):
    id: UUID_TYPE
    name: str


class TeacherSearchParams(BaseQueryParams):
    department_id: Optional[UUID_TYPE] = Field(None)


class ListTeacherResponse(BaseModel):
    data: list[TeacherResponse]
    total: int


class TeacherCreateResponse(TeacherPublic):
    teacher_information: UserInformationPublic
    teacher_relative: Optional[List[RelativePublic]] = None
