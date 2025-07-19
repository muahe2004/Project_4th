from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer, Float

class RoomBase(SQLModel):
    room_number: int = Field(sa_column=Column(Integer, nullable=False, unique=True))
    type: str = Field(sa_column=Column(String(50), nullable=False)) 
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True)) 
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))