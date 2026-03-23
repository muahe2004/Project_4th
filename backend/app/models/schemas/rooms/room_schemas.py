from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer
from uuid import UUID
from typing import List, Optional

from app.models.schemas.common.query import BaseQueryParams


class RoomBase(SQLModel):
    room_number: int = Field(sa_column=Column(Integer, nullable=False, unique=True))
    type: str = Field(sa_column=Column(String(50), nullable=False))
    seats: int = Field(ge=1, sa_column=Column(Integer, nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class RoomsPublic(RoomBase):
    id: UUID

class RoomListResponse(SQLModel):
    total: int
    data: List[RoomsPublic]

class RoomCreate(RoomBase):
    pass

class RoomUpdate(SQLModel):
    room_number: Optional[int] = Field(
        sa_column=Column(Integer, nullable=False, unique=True)
    )
    type: Optional[str] = Field(sa_column=Column(String(50), nullable=False))
    seats: Optional[int] = Field(default=None, ge=1, sa_column=Column(Integer, nullable=True))
    status: Optional[str] | None = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )

class RoomDeleteResponse(SQLModel):
    message: str
    id: UUID

class RoomDropDownResponse(SQLModel):
    id: UUID
    room_number: int
    type: str
    seats: int

class RoomSearchParams(BaseQueryParams):
    pass
