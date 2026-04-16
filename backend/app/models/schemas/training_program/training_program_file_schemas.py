from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class TrainingProgramFileSubjectData(SQLModel):
    subject_code: str | None = None
    subject_name: str | None = None
    term: int | None = None


class TrainingProgramFileData(SQLModel):
    program_type: str | None = None
    training_program_name: str | None = None
    academic_year: str | None = None
    specialization_id: str | None = None
    specialization_code: str | None = None
    specialization_name: str | None = None
    subjects: list[TrainingProgramFileSubjectData] = Field(default_factory=list)


class TrainingProgramFileInvalidSubject(TrainingProgramFileSubjectData):
    row: int
    errors: list[str] = Field(default_factory=list)


class TrainingProgramFileInfo(SQLModel):
    file_name: str
    headers: list[str] = Field(default_factory=list)
    header_row: int
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int
    parsed_at: datetime = Field(default_factory=datetime.now)


class TrainingProgramFileDataResponse(SQLModel):
    file_information: TrainingProgramFileInfo
    training_program: TrainingProgramFileData
    invalid_subjects: list[TrainingProgramFileInvalidSubject] = Field(default_factory=list)
