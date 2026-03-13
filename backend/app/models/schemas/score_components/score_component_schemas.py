from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, DateTime, Float, Text
from uuid import UUID


class ScoreComponentBase(SQLModel):
    subject_id: UUID = Field(foreign_key="subjects.id")
    component_type: str = Field(sa_column=Column(String(50), nullable=False))
    weight: float = Field(sa_column=Column(Float, nullable=False))
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


class ScoreComponentPublic(ScoreComponentBase):
    id: UUID


class ScoreComponentCreate(ScoreComponentBase):
    pass


class ScoreComponentUpdate(SQLModel):
    subject_id: Optional[UUID] = Field(foreign_key="subjects.id")
    component_type: Optional[str] = Field(sa_column=Column(String(50), nullable=False))
    weight: Optional[float] = Field(sa_column=Column(Float, nullable=False))
    description: Optional[str] | None = Field(
        default=None, sa_column=Column(Text, nullable=True)
    )
    status: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class ScoreComponentDeleteResponse(SQLModel):
    message: str
    id: UUID
