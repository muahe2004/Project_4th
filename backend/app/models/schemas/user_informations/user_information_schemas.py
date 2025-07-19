from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text    
from uuid import UUID

class UserInformationBase(SQLModel):
    citizen_id: str = Field(sa_column=Column(String(12), nullable=False, unique=True))
    issue_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    issue_place: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    nationality: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    ethnicity: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    religion: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    insurance_number: str | None = Field(default=None, sa_column=Column(String(20), nullable=True))
    student_id: UUID | None = Field(default=None, foreign_key="students.id")
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")