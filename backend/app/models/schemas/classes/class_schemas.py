from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Integer, DateTime 
from uuid import UUID

class ClassBase(SQLModel):
    class_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    size: int | None = Field(default=None, sa_column=Column(Integer, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    specialization_id: UUID = Field(foreign_key="specializations.id")
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")

class ClassPublic(ClassBase):
    id: UUID

class ClassCreate(ClassBase):
    pass

class ClassUpdate(SQLModel):
    class_code: Optional[str] = Field(default=None, sa_column=Column(String(12), nullable=True))
    size: Optional[int] = Field(default=None, sa_column=Column(Integer, nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    specialization_id: Optional[UUID] = Field(default=None, foreign_key="specializations.id")
    teacher_id: Optional[UUID] = Field(default=None, foreign_key="teachers.id")
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ClassDeleteResponse(SQLModel):
    message: str
    id: UUID