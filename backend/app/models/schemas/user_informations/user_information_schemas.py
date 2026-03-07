from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text    
from uuid import UUID
from typing import Optional

class UserInformationBase(SQLModel):
    place_of_origin: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    exempted_group: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    priority_group: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    citizen_id: str | None = Field(default=None, sa_column=Column(String(12), nullable=True))
    issue_date: datetime | None = Field(default=None, sa_column=Column(DateTime, nullable=True))
    issue_place: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    nationality: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    ethnicity: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    religion: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    insurance_number: str | None = Field(default=None, sa_column=Column(String(20), nullable=True))
    student_id: UUID | None = Field(default=None, foreign_key="students.id")
    teacher_id: UUID | None = Field(default=None, foreign_key="teachers.id")
    bank_name: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    bank_account_number: str | None = Field(default=None, sa_column=Column(String(30), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class UserInformationPublic(UserInformationBase):
    id: UUID

class UserInformationCreate(UserInformationBase):
    pass

class StudentInformationCreate(SQLModel):
    citizen_id: Optional[str] = None
    place_of_origin: Optional[str] = None
    exempted_group: Optional[str] = None
    priority_group: Optional[str] = None
    issue_date: Optional[datetime] = None
    issue_place: Optional[str] = None
    nationality: Optional[str] = None
    ethnicity: Optional[str] = None
    religion: Optional[str] = None
    insurance_number: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None

class UserInformationUpdate(SQLModel):
    place_of_origin: Optional[str] | None = Field(default=None, sa_column=Column(Text, nullable=True))
    exempted_group: Optional[str] | None = Field(default=None, sa_column=Column(Text, nullable=True))
    priority_group: Optional[str] | None = Field(default=None, sa_column=Column(Text, nullable=True))
    citizen_id: Optional[str] | None = Field(default=None, sa_column=Column(String(12), nullable=False, unique=True))
    issue_date: Optional[datetime] = Field(default=None, sa_column=Column(DateTime, nullable=True))
    issue_place: Optional[str] | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    nationality: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    ethnicity: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    religion: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    insurance_number: Optional[str] | None = Field(default=None, sa_column=Column(String(20), nullable=True))
    student_id: Optional[UUID] | None = Field(default=None, foreign_key="students.id")
    teacher_id: Optional[UUID] | None = Field(default=None, foreign_key="teachers.id")
    bank_name: Optional[str] | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    bank_account_number: Optional[str] | None = Field(default=None, sa_column=Column(String(30), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class UserInformationDeleteResponse(SQLModel):
    message: str
    id: UUID