from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Text
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