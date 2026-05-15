from fastapi import APIRouter, Request

from app.api.deps import SessionDep
from app.models.schemas.ai.intent_schemas import (
    PredictIntentRequest,
    PredictIntentResponse,
)
from app.services.ai import AIService

router = APIRouter()


@router.post("/predict-intent", response_model=PredictIntentResponse)
def predict_intent(
    payload: PredictIntentRequest,
    session: SessionDep,
    request: Request,
) -> PredictIntentResponse:
    auth_header = request.headers.get("authorization")
    print("AI predict-intent authorization header present:", bool(auth_header))
    print("AI predict-intent authorization header value:", auth_header)
    print(
        "AI predict-intent payload role=",
        payload.role,
        "user_id=",
        payload.user_id,
        "text=",
        payload.text,
        "history_len=",
        len(payload.history),
    )
    result = AIService.predict_intent(payload)
    result = AIService.enrich_with_date_range(result, session=session)
    result = AIService.enrich_with_service_data(
        result,
        session=session,
        role=payload.role,
        user_id=payload.user_id,
    )
    return PredictIntentResponse(**result)
