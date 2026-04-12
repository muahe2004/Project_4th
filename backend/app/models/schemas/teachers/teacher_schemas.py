from datetime import datetime
from enum import StrEnum
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
from app.models.schemas.shared.teaching_schedule_embeds import TeachingScheduleInTeacher
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
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    password: str = Field(sa_column=Column(String(100), nullable=False))


class TeacherPublic(TeacherBase):
    id: UUID_TYPE

class TeacherWithLearningSchedules(SQLModel):
    teacher_information: TeacherPublic
    teaching_schedules: list[TeachingScheduleInTeacher]

class TeacherWithLearningSchedulesResponse(SQLModel): 
    data: list[TeacherWithLearningSchedules]
    total: int


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


class TeacherFileData(SQLModel):
    teacher_code: str | None = Field(default=None)
    name: str | None = Field(default=None)
    gender: str | None = Field(default=None)
    date_of_birth: datetime | None = Field(default=None)
    email: str | None = Field(default=None)
    phone: str | None = Field(default=None)
    address: str | None = Field(default=None)


class TeacherFileInvalidRow(TeacherFileData):
    row: int
    errors: list[str] = Field(default_factory=list)


class TeacherFileInfo(SQLModel):
    file_name: str
    headers: list[str] = Field(default_factory=list)
    header_row: int
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int


class TeacherFileDataResponse(SQLModel):
    file_information: TeacherFileInfo
    teachers: list[TeacherFileData] = Field(default_factory=list)
    invalid_teachers: list[TeacherFileInvalidRow] = Field(default_factory=list)


class TeacherUploadField(StrEnum):
    CODE = "teacher_code"
    NAME = "name"
    GENDER = "gender"
    DATE_OF_BIRTH = "date_of_birth"
    ADDRESS = "address"
    PHONE = "phone"
    EMAIL = "email"


class TeacherCreateResponse(TeacherPublic):
    teacher_information: UserInformationPublic
    teacher_relative: Optional[List[RelativePublic]] = None
