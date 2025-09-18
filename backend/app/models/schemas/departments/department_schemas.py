from datetime import datetime
from typing import List
from sqlmodel import SQLModel, Field, Column, String, DateTime
import uuid

class DepartmentBase(SQLModel):
    department_code: str = Field(sa_column=Column(String(12), nullable=False))
    name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str | None = Field(default=None)
    established_date: datetime | None = Field(default=None)
    status: str | None = Field(default=None, sa_column=Column(String(50)))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class DepartmentPublic(DepartmentBase):
    id: uuid.UUID

class DepartmentListResponse(SQLModel):
    total: int
    data: List[DepartmentPublic]

class DepartmentCreate(DepartmentBase):
    pass
class DepartmentUpdate(SQLModel):
    department_code: str | None = Field(default=None, sa_column=Column(String(12), nullable=True))
    name: str | None = Field(default=None, sa_column=Column(String(100), nullable=True))
    description: str | None = Field(default=None)
    established_date: datetime | None = Field(default=None)
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class DepartmentDeleteResponse(SQLModel):
    message: str
    id: uuid.UUID