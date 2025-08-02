from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, DateTime, Float, Text
from uuid import UUID

class ScoreComponentBase(SQLModel):
    subject_id: UUID = Field(foreign_key="subjects.id")
    component_type: str = Field(sa_column=Column(String(50), nullable=False))
    weight: float = Field(sa_column=Column(Float, nullable=False))  # Weight should be between 0 and 1
    description: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))