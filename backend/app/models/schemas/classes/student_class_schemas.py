from datetime import datetime
from uuid import UUID as UUID_TYPE
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from typing import Optional


class BaseModel(SQLModel):
    model_config = dict(arbitrary_types_allowed=True)

class StudentClassBase(BaseModel):
    student_id: Optional[UUID_TYPE] = Field(default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True))
    class_id: UUID_TYPE = Field(foreign_key="classes.id")
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    class_type: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class StudentClassPublic(StudentClassBase):
    id: UUID_TYPE

class StudentClassCreate(StudentClassBase):
    pass

class StudentClassRegisterCourseSection(SQLModel):
    class_id: UUID_TYPE = Field(foreign_key="classes.id")
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    class_type: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))


class StudentClassRegisterRequest(SQLModel):
    student_id: UUID_TYPE
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False))
    course_sections: list[StudentClassRegisterCourseSection]

class StudentClassUpdate(BaseModel):
    student_id: Optional[UUID_TYPE] = Field(default=None, sa_column=Column(PG_UUID(as_uuid=True), nullable=True))
    class_id: UUID_TYPE = Field(foreign_key="classes.id")
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class StudentClassDeleteResponse(BaseModel):
    message: str
    id: UUID_TYPE

class StudentClassQueryParams(BaseQueryParams):
    class_id: Optional[UUID_TYPE] = Field(None)
    student_id: Optional[UUID_TYPE] = Field(None)
