from sqlmodel import Field, SQLModel
from app.models.schemas.common.query import DateRange


class PredictIntentRequest(SQLModel):
    message: str
    time_scope: str | None = None
    intent: str | None = None


class PredictIntentResponse(SQLModel):
    intent: str
    service_name: str = "unknown"
    time_scope: str | None = None
    date_range: DateRange | None = None
    service_data: list[dict] = Field(default_factory=list)
    confidence: float
    index: int
    normalized_text: str
