from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import Float
from sqlmodel import SQLModel, Field, Column, DateTime


class StudentTuitionFeeBase(SQLModel):
    student_id: UUID = Field(foreign_key="students.id")
    tuition_fee_id: UUID = Field(foreign_key="tuition_fees.id")
    reduction: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    payable_amount: float = Field(sa_column=Column(Float, nullable=False))
    paid_amount: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    debt_amount: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    surplus: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class StudentTuitionFeePublic(StudentTuitionFeeBase):
    id: UUID

class StudentTuitionFeeCreate(StudentTuitionFeeBase):
    pass

class StudentTuitionFeeUpdate(SQLModel):
    student_id: Optional[UUID] = Field(default=None, foreign_key="students.id")
    tuition_fee_id: Optional[UUID] = Field(default=None, foreign_key="tuition_fees.id")
    reduction: Optional[float] | None = Field(default=None, sa_column=Column(Float, nullable=True))
    payable_amount: Optional[float] = Field(default=None, sa_column=Column(Float, nullable=False))
    paid_amount: Optional[float] | None = Field(default=None, sa_column=Column(Float, nullable=True))
    debt_amount: Optional[float] | None = Field(default=None, sa_column=Column(Float, nullable=True))
    surplus: Optional[float] | None = Field(default=None, sa_column=Column(Float, nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class StudentTuitionFeeDeleteResponse(SQLModel):
    message: str
    id: UUID


class StudentTuitionFeeBulkCreateRequest(SQLModel):
    department_ids: list[UUID] = Field(default_factory=list)
    reduction: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    paid_amount: float | None = Field(default=None, sa_column=Column(Float, nullable=True))


class StudentTuitionFeeBulkCreateResponse(SQLModel):
    department_ids: list[UUID]
    matched_students: int
    created_records: int
    skipped_no_class: int
    skipped_no_term_match: int
    skipped_no_specialization_match: int
    skipped_no_major_match: int
    skipped_duplicate: int
