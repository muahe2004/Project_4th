from fastapi import APIRouter, Request

from app.api.deps import SessionDep
from app.middleware.decodedToken import decode_jwt, get_token_from_cookie
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
    print("AI predict-intent payload message=", payload.message)
    current_user_id = ""
    current_user_role = ""
    try:
        token = get_token_from_cookie(request)
        claims = decode_jwt(token)
        current_user_id = str(claims.get("id") or "")
        current_user_role = str(claims.get("role") or "")
    except Exception:
        auth_header = request.headers.get("authorization", "")
        if auth_header.lower().startswith("bearer "):
            bearer_token = auth_header.split(" ", 1)[1].strip()
            try:
                claims = decode_jwt(bearer_token)
                current_user_id = str(claims.get("id") or "")
                current_user_role = str(claims.get("role") or "")
            except Exception:
                pass

    result = AIService.predict_intent(payload)
    result = AIService.enrich_with_date_range(result, session=session)
    result = AIService.enrich_with_service_data(
        result,
        session=session,
        role=current_user_role,
        user_id=current_user_id,
    )
    return PredictIntentResponse(**result)
