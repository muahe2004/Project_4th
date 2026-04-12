from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from uuid import UUID
from pydantic import BaseModel as PydanticBaseModel
from pydantic import ConfigDict, Field as PydanticField

from app.models.schemas.common.query import BaseQueryParams
from app.models.schemas.learning_schedules.learning_schedule_schemas import (
    LearningScheduleCreate,
    LearningSchedulePublic,
)

from app.models.schemas.shared.teaching_schedule_embeds import (
    TeachingScheduleClassInfo,
    TeachingScheduleRoomInfo,
    TeachingScheduleSubjectInfo,
    TeachingScheduleTeacherInfo,
)

class TeachingScheduleBase(SQLModel):
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    learning_schedule_id: UUID = Field(foreign_key="learning_schedules.id")
    status: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class TeachingSchedulPublic(TeachingScheduleBase):
    id: UUID


class TeachingScheduleWithLearningSchedulePublic(TeachingSchedulPublic):
    learning_schedule: LearningSchedulePublic


class TeachingScheduleCreate(SQLModel):
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    learning_schedule: LearningScheduleCreate
    status: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )

class TeachingScheduleLearningScheduleUpdate(SQLModel):
    class_id: Optional[UUID] = Field(default=None, foreign_key="classes.id")
    subject_id: Optional[UUID] = Field(default=None, foreign_key="subjects.id")
    date: Optional[datetime] = Field(default=None, sa_column=Column(DateTime, nullable=False))
    start_period: Optional[int] = Field(default=None)
    end_period: Optional[int] = Field(default=None)
    room_id: Optional[UUID] | None = Field(default=None, foreign_key="rooms.id")
    schedule_type: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    status: Optional[str] = Field(
        default=None, sa_column=Column(String(500), nullable=True)
    )

class TeachingScheduleUpdate(SQLModel):
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    learning_schedule: Optional[TeachingScheduleLearningScheduleUpdate] = None
    status: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )

class TeachingScheduleDeleteResponse(SQLModel):
    message: str
    id: UUID

class TeachingScheduleResponse(PydanticBaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str | None = None
    created_at: datetime
    updated_at: datetime
    id: UUID
    learning_schedule: LearningSchedulePublic
    teacher: Optional[TeachingScheduleTeacherInfo] = None
    class_info: Optional[TeachingScheduleClassInfo] = PydanticField(
        default=None,
        alias="class",
    )
    room: Optional[TeachingScheduleRoomInfo] = None
    subject: Optional[TeachingScheduleSubjectInfo] = None


class TeachingScheduleSearchParams(BaseQueryParams):
    class_id: Optional[UUID] = Field(None)
    teacher_id: Optional[UUID] = Field(None)
    student_id: Optional[UUID] = Field(None)

class ListTeachingScheduleResponse(PydanticBaseModel):
    data: list[TeachingScheduleResponse]
    total: int

class ImportTeachingSchedulePeriod(SQLModel):
    start_date: datetime
    end_date: datetime

class ImportTeachingScheduleSubject(SQLModel):
    subject_code: str
    subject_name: str

class ImportTeachingScheduleTeacher(SQLModel):
    teacher_code: str
    teacher_name: str

class ImportTeachingCalenderDay(SQLModel):
    weekday_number: int
    date: datetime


class ImportTeachingCalenderImportedItem(SQLModel):
    row: int
    date: datetime
    learning_schedule_id: UUID
    teaching_schedule_id: UUID


class ImportTeachingCalenderItem(SQLModel):
    subject: ImportTeachingScheduleSubject
    teacher: ImportTeachingScheduleTeacher
    weeekday: int
    room: int
    lesson_periods: str
    study_weeks: str


class ImportTeachingCalenderResponse(SQLModel):
    items: list[ImportTeachingCalenderImportedItem] = Field(default_factory=list)


class ImportTeachingCalenderInput(SQLModel):
    period: ImportTeachingSchedulePeriod
    class_code: str
    schedules: list[ImportTeachingCalenderItem] = Field(default_factory=list)
