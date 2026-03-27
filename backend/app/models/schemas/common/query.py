from typing import Optional
from pydantic import Field
from sqlmodel import SQLModel
from datetime import date

class BaseQueryParams(SQLModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1)
    status: Optional[str] = Field(None)
    search: Optional[str] = Field(None)

class DateRange(SQLModel):
    start_date: Optional[date] = Field(None)
    end_date: Optional[date] = Field(None)