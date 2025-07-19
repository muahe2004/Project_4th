from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer, Float
from uuid import UUID

class ScoreBase(SQLModel):
    student_id: UUID = Field(foreign_key="students.id")
    score_component_id: UUID = Field(foreign_key="score_components.id")
    semester: int = Field(sa_column=Column(Integer, nullable=False))
    score: float = Field(sa_column=Column(Float, nullable=False))
    attempt: int = Field(default=1, sa_column=Column(Integer, default=1))
    score_type: str = Field(default='Official', sa_column=Column(String(20), default='Official')) #Chính thức / Thi lại / Cải thiện
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))