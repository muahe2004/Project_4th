from datetime import datetime
from typing import List, Optional
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import SQLModel, Field, Column, String, DateTime
from uuid import UUID


class SpecializationBase(SQLModel):
    specialization_code: str = Field(
        sa_column=Column(String(12), nullable=False, unique=True)
    )
    name: str = Field(sa_column=Column(String(100), nullable=False, unique=True))
    description: str | None = Field(default=None)
    established_date: datetime | None = Field(default=None)
    status: str | None = Field(default=None, sa_column=Column(String(50)))
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    major_id: UUID = Field(foreign_key="majors.id")


class SpecializationPublic(SpecializationBase):
    id: UUID


class SpecializationCreate(SpecializationBase):
    pass


class SpecializationUpdate(SQLModel):
    specialization_code: str | None = Field(
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


class SpecializationDeleteResponse(SQLModel):
    message: str
    id: UUID


class SpecializationQueryParams(BaseQueryParams):
    major_id: Optional[UUID] = Field(None)


class SpecializationListResponse(SQLModel):
    total: int
    data: List[SpecializationPublic]


class SpecializationDropdownResponse(SQLModel):
    id: UUID
    name: str
