from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Integer, DateTime, Text
from uuid import UUID
from typing import Optional

class SubjectBase(SQLModel):
    name: str = Field(sa_column=Column(String(100), nullable=False))
    credit: int = Field(sa_column=Column(Integer, nullable=False))  
    description: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class SubjectPublic(SubjectBase):
    id: UUID

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(SQLModel):
    name: Optional[str] = Field(sa_column=Column(String(100), nullable=False))
    credit: Optional[int] = Field(sa_column=Column(Integer, nullable=False))  
    description: Optional[str] | None = Field(default=None, sa_column=Column(Text, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class SubjectDeleteResponse(SQLModel):
    message: str
    id: UUID