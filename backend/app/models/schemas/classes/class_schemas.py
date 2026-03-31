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
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    specialization_id: UUID = Field(foreign_key="specializations.id")
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    class_type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    registration_status: str | None = Field(default="closed", sa_column=Column(String(20), nullable=True, default="closed"))
    subject_id: UUID | None = Field(default=None, foreign_key="subjects.id") # for class_type = course_section

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

class ClassesRegisterTeacher(SQLModel):
    teacher_id: UUID
    teacher_name: str
    teacher_code: str
    teacher_email: Optional[str] = None
    teacher_phone: Optional[str] = None

class ClassesRegisterSpecialization(SQLModel):
    specialization_id: UUID
    specialization_code: str
    specialization_name: str

class ClassesRegisterSubject(SQLModel):
    subject_id: UUID
    subject_code: str
    subject_name: str
    subject_credit: int

class ClassesForRegister(SQLModel):
    class_info: ClassPublic
    teacher_info: ClassesRegisterTeacher
    specialization_info: ClassesRegisterSpecialization
    subject_info: ClassesRegisterSubject

class ClassesForRegisterResponse(SQLModel):
    data: List[ClassesForRegister]
    total: int
    
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
    subject_id: Optional[UUID] = Field(default=None, foreign_key="subjects.id")
    class_type: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    registration_status: Optional[str] = Field(
        default=None, sa_column=Column(String(20), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )

class ClassDeleteResponse(SQLModel):
    message: str
    id: UUID

class ClassQueryParams(BaseQueryParams):
    specialization_id: Optional[UUID] = Field(None)
    teacher_id: Optional[UUID] = Field(None)
    class_type: Optional[str] = Field(None)
    registration_status: Optional[str] = Field(None)

class ClassListResponse(SQLModel):
    total: int
    data: List[ClassesResponse]

class ClassWithLearningSchedules(SQLModel):
    class_information: ClassPublic
    teaching_schedules: list[TeachingScheduleInClass]

class ClassWithLearningSchedulesResponse(SQLModel): 
    data: list[ClassWithLearningSchedules]
    total: int
