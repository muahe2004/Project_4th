from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Text
from typing import Optional
from uuid import UUID

class StudentBase(SQLModel):
    student_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    date_of_birth: datetime | None = Field(default=None)
    gender: str | None = Field(default=None, sa_column=Column(String(1), nullable=False))
    email: str | None = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: str | None = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    class_id: UUID | None = Field(default=None, foreign_key="classes.id")
    training_program: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    course: str | None = Field(default=None, sa_column=Column(String(20), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class StudentPublic(StudentBase):
    id: UUID

class StudentWithCitizenID(StudentPublic):
    citizen_id: str

class StudentCreate(StudentBase):
    pass

class StudentCreateWithUserInfor(StudentBase):
    citizen_id: str
    pass

class StudentUpdate(StudentBase):
    student_code: Optional[str] = Field(default = None, sa_column = Column(String(12), nullable = True))
    name: Optional[str] = Field(default = None, sa_column = Column(String(100), nullable = True))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=False, unique=True))
    phone: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    class_id: Optional[UUID] = Field(default=None, foreign_key="classes.id")
    training_program: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    course: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class StudentDeleteResponse(SQLModel):
    message: str
    id: UUID