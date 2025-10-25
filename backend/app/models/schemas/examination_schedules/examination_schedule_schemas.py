from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from uuid import UUID
from typing import Optional

class ExaminationScheduleBase(SQLModel):
    class_id: UUID = Field(foreign_key="classes.id")
    subject_id: UUID = Field(foreign_key="subjects.id")
    date: datetime = Field(sa_column=Column(DateTime, nullable=False))
    start_time: datetime = Field(sa_column=Column(DateTime, nullable=False))
    end_time: datetime = Field(sa_column=Column(DateTime, nullable=False))
    room_id: UUID | None = Field(default=None, foreign_key="rooms.id")
    schedule_type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(500), nullable=True))
    invigilator_1_id: UUID | None = Field(default=None)
    invigilator_2_id: UUID | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ExaminationSchedulePublic(ExaminationScheduleBase):
    id: UUID

class ExaminationScheduleCreate(ExaminationScheduleBase):
    pass
class ExaminationScheduleUpdate(SQLModel):
    class_id: Optional[UUID] = Field(foreign_key="classes.id")
    subject_id: Optional[UUID] = Field(foreign_key="subjects.id")
    date: Optional[datetime] = Field(sa_column=Column(DateTime, nullable=False))
    start_time: Optional[datetime] = Field(sa_column=Column(DateTime, nullable=False))
    end_time: Optional[datetime] = Field(sa_column=Column(DateTime, nullable=False))
    room_id: Optional[UUID] | None = Field(default=None, foreign_key="rooms.id")
    schedule_type: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: Optional[str] | None = Field(default=None, sa_column=Column(String(500), nullable=True))
    invigilator_1_id: Optional[UUID] | None = Field(default=None)
    invigilator_2_id: Optional[UUID] | None = Field(default=None)
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ExaminationScheduleDeleteResponse(SQLModel):
    message: str
    id: UUID