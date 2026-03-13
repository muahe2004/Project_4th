from datetime import datetime
from typing import List, Optional
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import SQLModel, Field, Column, String, DateTime
from uuid import UUID


class MajorBase(SQLModel):
    major_code: str = Field(sa_column=Column(String(12), nullable=False))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str | None = Field(default=None)
    established_date: datetime | None = Field(default=None)
    status: str | None = Field(default=None, sa_column=Column(String(50)))
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    department_id: UUID = Field(foreign_key="departments.id")


class MajorPublic(MajorBase):
    id: UUID


class MajorCreate(MajorBase):
    pass


class MajorListResponse(SQLModel):
    total: int
    data: List[MajorPublic]


class MajorUpdate(SQLModel):
    major_code: str | None = Field(
        default=None, sa_column=Column(String(12), nullable=True)
    )
    name: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    description: str | None = Field(default=None)
    established_date: datetime | None = Field(default=None)
    status: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class MajorDeleteResponse(SQLModel):
    message: str
    id: UUID


class MajorQueryParams(BaseQueryParams):
    department_id: Optional[UUID] = Field(None)
