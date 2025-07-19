from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer, Float
from uuid import UUID

class TuitionFeeBase(SQLModel):
    academic_year: str = Field(sa_column=Column(String(20), nullable=False))
    amount: float = Field(sa_column=Column(Float, nullable=False))
    reduction: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    payable_amount: float = Field(sa_column=Column(Float, nullable=False))
    paid_amount: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    debt_amount: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    surplus: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    student_id: UUID = Field(foreign_key="students.id")
    type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    start_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    end_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    name: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))