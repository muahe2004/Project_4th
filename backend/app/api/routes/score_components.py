import uuid
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.score_components.score_component_schemas import (
    ScoreComponentPublic,
    ScoreComponentCreate,
    ScoreComponentUpdate,
    ScoreComponentDeleteResponse
)
from app.services.score_components import ScoreComponentServices
from typing import List

router = APIRouter()

# =========================== get all score component ===========================
@router.get("", response_model = List[ScoreComponentPublic])
def get_scores(session: SessionDep) -> List[ScoreComponentPublic]:
    return ScoreComponentServices.get_all(session=session)

# =========================== get score component by id ===========================
@router.get(
    "/{id}",
    response_model=ScoreComponentPublic
)
def get_score_component_by_id(
    session: SessionDep,
    id: uuid.UUID,
    request: Request
) -> ScoreComponentPublic:
    return ScoreComponentServices.get_by_id(session=session, score_component_id=id, request=request)

# =========================== create score component ===========================
@router.post(
    "",
    response_model=ScoreComponentPublic,   
) 
def create_score_component(
    request: Request,
    session: SessionDep,
    data: ScoreComponentCreate
) -> ScoreComponentPublic:
    return ScoreComponentServices.create(session=session, score_component=data)

# =========================== update score component ===========================
@router.patch(
    "/{id}",
    response_model=ScoreComponentPublic,  
)
def update_score_component(
    session: SessionDep,
    id: uuid.UUID,
    data: ScoreComponentUpdate
) -> ScoreComponentPublic:
    return ScoreComponentServices.update(session=session, score_component_id=id, score_component_data=data)

# =========================== delete score component ===========================
@router.delete(
    "/{id}",
    response_model=ScoreComponentDeleteResponse,  
)
def delete_score_component(
    session: SessionDep,
    id: uuid.UUID
) -> ScoreComponentDeleteResponse:
    return ScoreComponentServices.delete(session=session, score_component_id=id)
