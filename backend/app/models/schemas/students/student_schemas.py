from datetime import datetime
from uuid import UUID as UUID_TYPE
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from typing import List, Optional
from enum import StrEnum 

from app.models.schemas.common.query import BaseQueryParams
from app.models.schemas.relatives.relative_schemas import (
    RelativePublic,
    UserRelativeCreate,
)
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationCreate,
    UserInformationPublic,
)


class BaseModel(SQLModel):
    model_config = dict(arbitrary_types_allowed=True)


class StudentBase(BaseModel):
    student_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
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
    # class_id: Optional[UUID_TYPE] = Field(
    #     default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True)
    # )
    training_program: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    course: Optional[str] = Field(
        default=None, sa_column=Column(String(20), nullable=True)
    )
    status: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    password: str = Field(sa_column=Column(String(100), nullable=False))


class StudentPublic(StudentBase):
    id: UUID_TYPE
    class_id: Optional[UUID_TYPE] = None


class StudentWithCitizenID(StudentPublic):
    citizen_id: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentCreateWithUserInfor(StudentBase):
    class_id: Optional[UUID_TYPE] = None
    student_information: UserInformationCreate
    student_relatives: List[UserRelativeCreate]


class StudentCreateResponse(StudentPublic):
    student_information: UserInformationPublic
    student_relative: Optional[List[RelativePublic]] = None


class StudentUpdate(BaseModel):
    student_code: Optional[str] = Field(
        default=None, sa_column=Column(String(12), nullable=True)
    )
    name: Optional[str] = Field(
        default=None, sa_column=Column(String(100), nullable=True)
    )
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
    class_id: Optional[UUID_TYPE] = Field(
        default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True)
    )
    training_program: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    course: Optional[str] = Field(
        default=None, sa_column=Column(String(20), nullable=True)
    )
    status: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    student_information: Optional[UserInformationCreate] = None
    student_relatives: Optional[List[UserRelativeCreate]] = None


class StudentDeleteResponse(BaseModel):
    message: str
    id: UUID_TYPE


class StudentsResponse(StudentPublic):
    password: Optional[str] = None  # override field from parent
    class_code: Optional[str] = None
    class_name: Optional[str] = None
    student_information: Optional[UserInformationPublic] = None
    student_relative: Optional[List[RelativePublic]] = None


class ListStudentResponse(BaseModel):
    data: list[StudentsResponse]
    total: int


class StudentQueryParams(BaseQueryParams):
    class_id: Optional[UUID_TYPE] = Field(None)

class StudentFileData(SQLModel):
    student_code: str | None = Field(default=None)
    name: str | None = Field(default=None)
    gender: str | None = Field(default=None)
    date_of_birth: datetime | None = Field(default=None)
    email: str | None = Field(default=None)
    phone: str | None = Field(default=None)
    address: str | None = Field(default=None)
    class_id: UUID_TYPE | None = Field(default=None)
    class_code: str | None = Field(default=None)
    class_name: str | None = Field(default=None)


class StudentFileInvalidRow(StudentFileData):
    row: int
    errors: list[str] = Field(default_factory=list)


class StudentFileInfo(SQLModel):
    file_name: str
    headers: list[str] = Field(default_factory=list)
    header_row: int
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int

class StudentFileDataResponse(SQLModel):
    file_information: StudentFileInfo
    students: list[StudentFileData] = Field(default_factory=list)
    invalid_students: list[StudentFileInvalidRow] = Field(default_factory=list)

class StudentUploadField(StrEnum):
    CODE = "student_code"
    NAME = "name"
    GENDER = "gender"
    CLASS_CODE = "class_code"
    DATE_OF_BIRTH = "date_of_birth"
    ADDRESS = "address"
    PHONE = "phone"
    EMAIL = "email"
