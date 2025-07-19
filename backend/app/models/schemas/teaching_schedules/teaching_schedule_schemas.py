from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from uuid import UUID

class TeachingScheduleBase(SQLModel):
    teacher_id: UUID = Field(foreign_key="teachers.id")
    learning_schedule_id: UUID = Field(foreign_key="learning_schedules.id")
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))