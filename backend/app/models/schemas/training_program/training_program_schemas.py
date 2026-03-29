from datetime import datetime
from app.models.schemas.shared.teaching_schedule_embeds import TeachingScheduleInRoom
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer
from uuid import UUID
from typing import List, Optional

from app.models.schemas.common.query import BaseQueryParams

class TrainingProgramBase(SQLModel):
    program_type: str = Field(sa_column=Column(String(50), nullable=False)) #VD: Đại học chính quy
    training_program_name: Optional[str] = Field(sa_column=Column(String(100), nullable=True))
    academic_year: str = Field(sa_column=Column(String(20), nullable=False))
    specialization_id: UUID = Field(foreign_key="specializations.id")
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TrainingProgramCreate(TrainingProgramBase):
    pass