from datetime import datetime
from app.models.schemas.shared.teaching_schedule_embeds import TeachingScheduleInRoom
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer
from uuid import UUID
from typing import List, Optional

from app.models.schemas.common.query import BaseQueryParams

class TrainingProgramSubjectBase(SQLModel):
    training_program_id: UUID = Field(foreign_key="training_program.id")
    subject_id: UUID = Field(foreign_key="subjects.id")
    term: int = Field(sa_column=Column(Integer, nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TrainingProgramSubjectCreate(TrainingProgramSubjectBase):
    pass