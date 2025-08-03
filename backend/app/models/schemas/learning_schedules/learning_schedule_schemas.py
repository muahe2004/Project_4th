from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer, Float
from uuid import UUID

class LearningScheduleBase(SQLModel):
    class_id: UUID = Field(foreign_key="classes.id")
    subject_id: UUID = Field(foreign_key="subjects.id")
    date: datetime = Field(sa_column=Column(DateTime, nullable=False))
    start_period: int = Field(sa_column=Column(Integer, nullable=False))
    end_period: int = Field(sa_column=Column(Integer, nullable=False))
    room_id: UUID | None = Field(default=None, foreign_key="rooms.id")
    schedule_type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(500), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class LearningSchedulePublic(LearningScheduleBase):
    id: UUID

class LearningScheduleCreate(LearningScheduleBase):
    pass

class LearningScheduleUpdate(SQLModel):
    class_id: Optional[UUID] = Field(foreign_key="classes.id")
    subject_id: Optional[UUID] = Field(foreign_key="subjects.id")
    date: Optional[datetime] = Field(sa_column=Column(DateTime, nullable=False))
    start_period: Optional[int] = Field(sa_column=Column(Integer, nullable=False))
    end_period: Optional[int] = Field(sa_column=Column(Integer, nullable=False))
    room_id: Optional[UUID] | None = Field(default=None, foreign_key="rooms.id")
    schedule_type: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(500), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class LearningScheduleDeleteResponse(SQLModel):
    message: str
    id: UUID