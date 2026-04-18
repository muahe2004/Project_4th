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


class UploadExaminationScheduleItem(SQLModel):
    subject_id: UUID | None = None
    subject_code: str | None = None
    subject_name: str | None = None
    class_id: UUID | None = None
    class_code: str | None = None
    class_name: str | None = None
    invigilator_1_id: UUID | None = None
    invigilator_1_code: str | None = None
    invigilator_1_name: str | None = None
    invigilator_2_id: UUID | None = None
    invigilator_2_code: str | None = None
    invigilator_2_name: str | None = None
    room_id: UUID | None = None
    room_number: int | None = None
    date: datetime | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    schedule_type: str | None = None


class UploadExaminationScheduleInvalidRow(UploadExaminationScheduleItem):
    row: int
    errors: list[str] = Field(default_factory=list)


class UploadExaminationScheduleFileInfo(SQLModel):
    file_name: str
    headers: list[str] = Field(default_factory=list)
    header_row: int
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int


class UploadExaminationScheduleResponse(SQLModel):
    file_information: UploadExaminationScheduleFileInfo
    schedules: list[UploadExaminationScheduleItem] = Field(default_factory=list)
    invalid_schedules: list[UploadExaminationScheduleInvalidRow] = Field(default_factory=list)


class ImportExaminationScheduleItem(SQLModel):
    subject_id: UUID
    class_id: UUID
    date: datetime
    start_time: datetime
    end_time: datetime
    room_id: UUID | None = None
    schedule_type: str | None = None
    status: str | None = None
    invigilator_1_id: UUID | None = None
    invigilator_2_id: UUID | None = None


class ImportExaminationScheduleInput(SQLModel):
    schedules: list[ImportExaminationScheduleItem] = Field(default_factory=list)


class ImportExaminationScheduleImportedItem(SQLModel):
    row: int
    id: UUID


class ImportExaminationScheduleResponse(SQLModel):
    items: list[ImportExaminationScheduleImportedItem] = Field(default_factory=list)
