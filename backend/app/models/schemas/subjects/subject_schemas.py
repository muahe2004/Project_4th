from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Integer, DateTime, Text

class SubjectBase(SQLModel):
    name: str = Field(sa_column=Column(String(100), nullable=False))
    credit: int = Field(sa_column=Column(Integer, nullable=False))  
    description: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))