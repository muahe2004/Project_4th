from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from uuid import UUID

class TeachingScheduleBase(SQLModel):
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    learning_schedule_id: UUID = Field(foreign_key="learning_schedules.id")
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TeachingSchedulPublic(TeachingScheduleBase):
    id: UUID

class TeachingScheduleCreate(TeachingScheduleBase):
    pass

class TeachingScheduleUpdate(SQLModel):
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    learning_schedule_id: Optional[UUID] = Field(foreign_key="learning_schedules.id")
    status: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TeachingScheduleDeleteResponse(SQLModel):
    message: str
    id: UUID
