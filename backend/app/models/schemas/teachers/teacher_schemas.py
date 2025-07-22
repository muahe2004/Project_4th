from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text
from uuid import UUID

class TeacherBase(SQLModel):
    teacher_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    date_of_birth: datetime | None = Field(default=None)
    gender: str | None = Field(default=None, sa_column=Column(String(1), nullable=False))
    email: str | None = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: str | None = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    academic_rank: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    department_id: UUID | None = Field(default=None, foreign_key="departments.id")
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    password: str = Field(sa_column=Column(String(100), nullable=False))

class TeacherPublic(TeacherBase):
    id: UUID

class TeacherWithCitizenID(TeacherPublic):
    citizen_id: str

class TeacherCreate(TeacherBase):
    pass

class TeacherCreateWithUserInfor(TeacherBase):
    citizen_id: str
    pass

class TeacherUpdate(SQLModel):
    teacher_code: Optional[str] = Field(default=None, sa_column=Column(String(12), nullable=True))
    name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[str] = Field(default=None, sa_column=Column(String(1), nullable=True))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    academic_rank: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    department_id: Optional[UUID] = Field(default=None, foreign_key="departments.id")
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TeacherDeleteResponse(SQLModel):
    message: str
    id: UUID