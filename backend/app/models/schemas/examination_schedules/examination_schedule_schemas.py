from datetime import datetime
from app.models.schemas.common.query import BaseQueryParams
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
    invigilator_1_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    invigilator_2_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ExaminationSchedulePublic(ExaminationScheduleBase):
    id: UUID

class ExaminationScheduleCreate(ExaminationScheduleBase):
    pass

class ExaminationScheduleUpdate(SQLModel):
    class_id: Optional[UUID] = Field(default=None, foreign_key="classes.id")
    subject_id: Optional[UUID] = Field(default=None, foreign_key="subjects.id")
    date: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    room_id: Optional[UUID] | None = Field(default=None, foreign_key="rooms.id")
    schedule_type: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: Optional[str] | None = Field(default=None, sa_column=Column(String(500), nullable=True))
    invigilator_1_id: Optional[UUID] | None = Field(default=None, foreign_key="teachers.id")
    invigilator_2_id: Optional[UUID] | None = Field(default=None, foreign_key="teachers.id")
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ExaminationScheduleDeleteResponse(SQLModel):
    message: str
    id: UUID

class ExaminationScheduleClassInfo(SQLModel):
    class_id: UUID
    class_code: Optional[str] = None
    class_name: Optional[str] = None

class ExaminationScheduleSubjectInfo(SQLModel):
    subject_id: UUID
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None

class ExaminationScheduleRoomInfo(SQLModel):
    room_id: UUID
    room_number: Optional[int] = None

class ExaminationScheduleInvigilatorInfo(SQLModel):
    invigilator_id: UUID
    invigilator_code: Optional[str] = None
    invigilator_name: Optional[str] = None
    invigilator_email: Optional[str] = None
    invigilator_phone_number: Optional[str] = None

class ExaminationScheduleResponse(SQLModel):
    id: UUID
    date: datetime
    start_time: datetime
    end_time: datetime
    status: Optional[str] = None
    schedule_type: Optional[str] = None
    class_info: Optional[ExaminationScheduleClassInfo] = None
    subject_info: Optional[ExaminationScheduleSubjectInfo] = None
    room_info: Optional[ExaminationScheduleRoomInfo] = None
    invigilator: list[ExaminationScheduleInvigilatorInfo] = Field(default_factory=list)

class ListExaminationScheduleResponse(SQLModel):
    data: list[ExaminationScheduleResponse]
    total: int

class ExaminationScheduleQueryParams(BaseQueryParams):
    subject_id: Optional[UUID] = Field(None)
    invigilator_id: Optional[UUID] = Field(None)
    class_id: Optional[UUID] = Field(None)
    student_id: Optional[UUID] = Field(None)
