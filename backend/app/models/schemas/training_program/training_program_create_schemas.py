from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel, Field, Column, String


class TrainingProgramSubjectItem(SQLModel):
    subject_code: str = Field(sa_column=Column(String(12), nullable=False))
    subject_name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    term: Optional[int] = Field(default=None, ge=1)


class TrainingProgramCreateWithSubjects(SQLModel):
    program_type: str = Field(sa_column=Column(String(50), nullable=False))
    training_program_name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    academic_year: str = Field(sa_column=Column(String(20), nullable=False))
    specialization_code: str = Field(sa_column=Column(String(12), nullable=False))
    specialization_name: Optional[str] = Field(default=None, sa_column=Column(String(100), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    subjects: list[TrainingProgramSubjectItem] = Field(default_factory=list)


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
