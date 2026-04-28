from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Float, Integer
from uuid import UUID
from app.models.schemas.common.query import BaseQueryParams


class TuitionFeeBase(SQLModel):
    academic_year: str = Field(sa_column=Column(String(20), nullable=False))
    amount: float = Field(sa_column=Column(Float, nullable=False))
    price_per_credit: float = Field(sa_column=Column(Float, nullable=False))
    training_program_id: UUID | None = Field(default=None, foreign_key="training_program.id")
    type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    start_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    end_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    name: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    term: int | None = Field(default=None, sa_column=Column(Integer, nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TuitionFeePublic(TuitionFeeBase):
    id: UUID


class TuitionFeeTrainingProgramInfo(SQLModel):
    id: UUID
    program_type: str
    training_program_name: Optional[str] = None
    academic_year: str


class TuitionFeeSpecializationInfo(SQLModel):
    id: UUID
    specialization_code: str
    specialization_name: str


class TuitionFeeMajorInfo(SQLModel):
    id: UUID
    major_code: str
    major_name: str


class TuitionFeeDepartmentInfo(SQLModel):
    id: UUID
    department_code: str
    department_name: str


class TuitionFeeSubjectInfo(SQLModel):
    subject_id: UUID
    subject_code: str
    subject_name: str
    subject_credit: int


class TuitionFeePublicDetail(TuitionFeePublic):
    training_program_info: TuitionFeeTrainingProgramInfo
    specialization_infor: TuitionFeeSpecializationInfo
    major_infor: TuitionFeeMajorInfo
    department_info: TuitionFeeDepartmentInfo
    subject_info: list[TuitionFeeSubjectInfo]


class TuitionFeeListResponse(SQLModel):
    data: list[TuitionFeePublicDetail]
    total: int


class TuitionFeeCreate(SQLModel):
    academic_year: str = Field(sa_column=Column(String(20), nullable=False))
    price_per_credit: float = Field(sa_column=Column(Float, nullable=False))
    department_id: UUID = Field(foreign_key="departments.id")
    type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    start_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    end_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    name: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TuitionFeeUpdate(SQLModel):
    academic_year: Optional[str] = Field(
        default=None, sa_column=Column(String(20), nullable=False)
    )
    price_per_credit: Optional[float] = Field(
        default=None, sa_column=Column(Float, nullable=False)
    )
    training_program_id: Optional[UUID] = Field(
        default=None, foreign_key="training_program.id"
    )
    type: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    status: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    start_date: Optional[datetime] | None = Field(
        default=None, sa_column=Column(DateTime, nullable=True)
    )
    end_date: Optional[datetime] | None = Field(
        default=None, sa_column=Column(DateTime, nullable=True)
    )
    name: Optional[str] | None = Field(
        default=None, sa_column=Column(String(100), nullable=True)
    )
    term: Optional[int] = Field(default=None, sa_column=Column(Integer, nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class TuitionFeeDeleteResponse(SQLModel):
    message: str
    id: UUID


class TuitionFeeQueryParams(BaseQueryParams):
    training_program_id: Optional[UUID] = Field(default=None)
    specialization_id: Optional[UUID] = Field(default=None)
    major_id: Optional[UUID] = Field(default=None)
    department_id: Optional[UUID] = Field(default=None)
