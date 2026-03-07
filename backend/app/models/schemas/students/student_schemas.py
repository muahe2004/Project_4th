from datetime import datetime
from uuid import UUID as UUID_TYPE, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from typing import List, Optional

from app.models.schemas.common.query import BaseQueryParams
from app.models.schemas.relatives.relative_schemas import RelativePublic, StudentRelativeCreate
from app.models.schemas.user_informations.user_information_schemas import StudentInformationCreate, UserInformationPublic

class BaseModel(SQLModel):
    model_config = dict(arbitrary_types_allowed=True)

class StudentBase(BaseModel):
    student_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[str] = Field(default=None, sa_column=Column(String(1), nullable=False))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    class_id: Optional[UUID_TYPE] = Field(default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True))
    training_program: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    course: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    password: str = Field(sa_column=Column(String(100), nullable=False))

class StudentPublic(StudentBase):
    id: UUID_TYPE

class StudentWithCitizenID(StudentPublic):
    citizen_id: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentCreateWithUserInfor(StudentBase):
    student_information: StudentInformationCreate
    student_relatives: List[StudentRelativeCreate]

class StudentCreateResponse(StudentPublic):
    student_information: UserInformationPublic
    student_relative: Optional[List[RelativePublic]] = None

class StudentUpdate(BaseModel):
    student_code: Optional[str] = Field(default=None, sa_column=Column(String(12), nullable=True))
    name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    class_id: Optional[UUID_TYPE] = Field(default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True))
    training_program: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    course: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    student_information: Optional[StudentInformationCreate] = None
    student_relatives: Optional[List[StudentRelativeCreate]] = None

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