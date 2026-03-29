from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, Integer, DateTime, Text
from uuid import UUID as UUID_TYPE
from typing import List, Optional

class SubjectBase(SQLModel):
    subject_code: str = Field(sa_column=Column(String(12), nullable=False))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    credit: int = Field(sa_column=Column(Integer, nullable=False))
    description: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    status: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class SubjectPublic(SubjectBase):
    id: UUID_TYPE


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(SQLModel):
    subject_code: Optional[str] = Field(sa_column=Column(String(12), nullable=False))
    name: Optional[str] = Field(sa_column=Column(String(100), nullable=False))
    credit: Optional[int] = Field(sa_column=Column(Integer, nullable=False))
    description: Optional[str] | None = Field(
        default=None, sa_column=Column(Text, nullable=True)
    )
    status: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class SubjectDeleteResponse(SQLModel):
    message: str
    id: UUID_TYPE

class SubjectListResponse(SQLModel):
    total: int
    data: List[SubjectPublic]


class SubjectDropdownResponse(SQLModel):
    id: UUID_TYPE
    subject_code: str
    name: str
