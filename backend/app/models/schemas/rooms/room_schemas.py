from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer, Float
from uuid import UUID
from typing import Optional

class RoomBase(SQLModel):
    room_number: int = Field(sa_column=Column(Integer, nullable=False, unique=True))
    type: str = Field(sa_column=Column(String(50), nullable=False)) 
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True)) 
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class RoomsPublic(RoomBase):
    id: UUID

class RoomCreate(RoomBase):
    pass

class RoomUpdate(SQLModel):
    room_number: Optional[int] = Field(sa_column=Column(Integer, nullable=False, unique=True))
    type: Optional[str] = Field(sa_column=Column(String(50), nullable=False)) 
    status: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True)) 
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class RoomDeleteResponse(SQLModel):
    message: str
    id: UUID