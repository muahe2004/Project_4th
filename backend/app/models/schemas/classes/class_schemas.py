from datetime import datetime
from typing import List, Optional
from app.models.schemas.shared.teaching_schedule_embeds import TeachingScheduleInClass
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, Integer, DateTime
from uuid import UUID
from app.models.schemas.common.query import BaseQueryParams

class ClassBase(SQLModel):
    class_code: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    class_name: Optional[str] = Field(sa_column=Column(String(100), nullable=True))
    size: int | None = Field(default=None, sa_column=Column(Integer, nullable=True))
    status: str | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )
    specialization_id: UUID = Field(foreign_key="specializations.id")
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")

class ClassPublic(ClassBase):
    id: UUID

class IdsRequest(SQLModel):
    ids: list[UUID]

class ClassDropDownResponse(SQLModel):
    id: UUID
    class_code: str
    class_name: str

class ClassesResponse(ClassPublic):
    specialization_id: UUID
    specialization_name: str
    teacher_name: str

class ClassCreate(ClassBase):
    pass

class ClassUpdate(SQLModel):
    class_code: Optional[str] = Field(
        default=None, sa_column=Column(String(12), nullable=True)
    )
    class_name: Optional[str] = Field(sa_column=Column(String(100), nullable=True))
    size: Optional[int] = Field(default=None, sa_column=Column(Integer, nullable=True))
    status: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    specialization_id: Optional[UUID] = Field(
        default=None, foreign_key="specializations.id"
    )
    teacher_id: Optional[UUID] = Field(default=None, foreign_key="teachers.id")
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )

class ClassDeleteResponse(SQLModel):
    message: str
    id: UUID

class ClassQueryParams(BaseQueryParams):
    specialization_id: Optional[UUID] = Field(None)
    teacher_id: Optional[UUID] = Field(None)

class ClassListResponse(SQLModel):
    total: int
    data: List[ClassesResponse]

class ClassWithLearningSchedules(SQLModel):
    class_information: ClassPublic
    teaching_schedules: list[TeachingScheduleInClass]

class ClassWithLearningSchedulesResponse(SQLModel): 
    data: list[ClassWithLearningSchedules]
    total: int