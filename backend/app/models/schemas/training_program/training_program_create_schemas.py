from typing import List, Optional
from uuid import UUID

from sqlmodel import SQLModel, Field, Column, String
from app.models.schemas.common.query import BaseQueryParams


class TrainingProgramSubjectItem(SQLModel):
    subject_code: str = Field(sa_column=Column(String(12), nullable=False))
    subject_name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    term: Optional[int] = Field(default=None, ge=1)


class TrainingProgramCreateWithSubjects(SQLModel):
    program_type: str = Field(sa_column=Column(String(50), nullable=False))
    training_program_name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    academic_year: str = Field(sa_column=Column(String(20), nullable=False))
    specialization_id: Optional[UUID] = Field(default=None)
    specialization_code: Optional[str] = Field(default=None, sa_column=Column(String(12), nullable=True))
    specialization_name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    subjects: list[TrainingProgramSubjectItem] = Field(default_factory=list)


class TrainingProgramUpdateSubjectItem(SQLModel):
    subject_id: UUID
    term: Optional[int] = Field(default=None, ge=1)


class TrainingProgramUpdateWithSubjects(SQLModel):
    program_type: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    training_program_name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    academic_year: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    specialization_id: Optional[UUID] = Field(default=None)
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    subjects: list[TrainingProgramUpdateSubjectItem] = Field(default_factory=list)


class TrainingProgramSubjectPublic(SQLModel):
    id: UUID
    training_program_id: UUID
    subject_id: UUID
    term: int
    status: str | None = None


class TrainingProgramWithSubjectsPublic(SQLModel):
    id: UUID
    program_type: str
    training_program_name: Optional[str] = None
    academic_year: str
    specialization_id: UUID
    status: str | None = None
    subjects: list[TrainingProgramSubjectPublic] = Field(default_factory=list)

class TrainingProgramSubjectDetailPublic(SQLModel):
    id: UUID
    training_program_id: UUID
    subject_id: UUID
    subject_code: str
    subject_name: str
    credit: int
    term: int
    status: str | None = None


class TrainingProgramDepartmentInfo(SQLModel):
    id: UUID
    department_code: str
    department_name: str


class TrainingProgramMajorInfo(SQLModel):
    id: UUID
    major_code: str
    major_name: str


class TrainingProgramSpecializationInfo(SQLModel):
    id: UUID
    specialization_code: str
    specialization_name: str


class TrainingProgramPublic(SQLModel):
    id: UUID
    program_type: str
    training_program_name: Optional[str] = None
    academic_year: str
    specialization_id: UUID
    specialization_infor: TrainingProgramSpecializationInfo
    major_infor: TrainingProgramMajorInfo
    department_info: TrainingProgramDepartmentInfo
    status: str | None = None
    subjects: list[TrainingProgramSubjectDetailPublic] = Field(default_factory=list)


class TrainingProgramListResponse(SQLModel):
    total: int
    data: List[TrainingProgramPublic]


class TrainingProgramQueryParams(BaseQueryParams):
    specialization_id: Optional[UUID] = Field(default=None)

class TrainingProgramUpdateResponse(TrainingProgramPublic):
    pass


class TrainingProgramDeleteResponse(SQLModel):
    message: str
    id: UUID
