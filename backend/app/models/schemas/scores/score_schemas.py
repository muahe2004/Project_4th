from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer, Float
from uuid import UUID

class ScoresBase(SQLModel):
    student_id: UUID = Field(foreign_key="students.id")
    score_component_id: UUID = Field(foreign_key="score_components.id")
    score: float = Field(sa_column=Column(Float, nullable=False))
    attempt: int = Field(default=1, sa_column=Column(Integer, default=1))
    score_type: str = Field(default='Official', sa_column=Column(String(20), default='Official')) #Chính thức / Thi lại / Cải thiện
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ScoresPublic(ScoresBase):
    id: UUID

class ScoresCreate(ScoresBase):
    pass

class ScoresUpdate(ScoresBase):
    score_component_id: Optional[UUID] = Field(foreign_key="score_components.id")
    score: float = Field(sa_column=Column(Float, nullable=False))
    attempt: Optional[int] = Field(default=1, sa_column=Column(Integer, default=1))
    score_type: Optional[str] = Field(default='Official', sa_column=Column(String(20), default='Official')) #Chính thức / Thi lại / Cải thiện
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ScoresDeleteResponse(SQLModel):
    message: str
    id: UUID