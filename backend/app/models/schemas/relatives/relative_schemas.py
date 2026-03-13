from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Text
from uuid import UUID
from typing import Optional


class RelativeBase(SQLModel):
    name: str = Field(sa_column=Column(String(100), nullable=False))
    date_of_birth: datetime | None = Field(
        default=None, sa_column=Column(DateTime, nullable=True)
    )
    nationality: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    ethnicity: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    religion: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    occupation: str | None = Field(
        default=None, sa_column=Column(String(100), nullable=True)
    )
    phone: str | None = Field(default=None, sa_column=Column(String(20), nullable=True))
    address: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    relationship: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    student_id: UUID | None = Field(default=None, foreign_key="students.id")
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class RelativePublic(RelativeBase):
    id: UUID


class RelativeCreate(RelativeBase):
    pass


class RelativeUpdate(SQLModel):
    name: Optional[str] = Field(sa_column=Column(String(100), nullable=False))
    date_of_birth: Optional[datetime] | None = Field(
        default=None, sa_column=Column(DateTime, nullable=True)
    )
    nationality: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    ethnicity: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    religion: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    occupation: Optional[str] | None = Field(
        default=None, sa_column=Column(String(100), nullable=True)
    )
    phone: Optional[str] | None = Field(
        default=None, sa_column=Column(String(20), nullable=True)
    )
    address: Optional[str] | None = Field(
        default=None, sa_column=Column(Text, nullable=True)
    )
    relationship: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    student_id: Optional[UUID] | None = Field(default=None, foreign_key="students.id")
    teacher_id: Optional[UUID] | None = Field(default=None, foreign_key="teachers.id")
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class RelativeDeleteResponse(SQLModel):
    message: str
    id: UUID


class UserRelativeCreate(SQLModel):
    name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = None
    ethnicity: Optional[str] = None
    religion: Optional[str] = None
    occupation: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    relationship: Optional[str] = None
