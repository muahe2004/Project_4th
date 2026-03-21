from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, Integer, DateTime

class AcademicTermBase(SQLModel):
    academic_year: str = Field(sa_column=Column(String(20), nullable=False))
    semester: int | None = Field(default=None, sa_column=Column(Integer))
    start_date: datetime = Field(sa_column=Column(DateTime, nullable=False))
    end_date: datetime = Field(sa_column=Column(DateTime, nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))