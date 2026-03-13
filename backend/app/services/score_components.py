import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.schemas.score_components.score_component_schemas import (
    ScoreComponentPublic,
    ScoreComponentCreate,
    ScoreComponentUpdate,
    ScoreComponentDeleteResponse,
)
from app.enums.status import StatusEnum
from app.models.models import ScoreComponents
from app.models.models import Scores


class ScoreComponentServices:
    @staticmethod
    def get_all(*, session: Session) -> List[ScoreComponentPublic]:
        score_components = session.exec(select(ScoreComponents)).all()
        return score_components

    @staticmethod
    def get_by_id(
        *, session: Session, score_component_id: uuid.UUID, request: Request
    ) -> ScoreComponentPublic:
        score_component = session.get(ScoreComponents, score_component_id)
        if not score_component:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Score component does not exist",
            )
        return ScoreComponentPublic.model_validate(score_component)

    @staticmethod
    def create(
        *, session: Session, score_component: ScoreComponentCreate
    ) -> ScoreComponentPublic:
        existing = session.exec(
            select(ScoreComponents).where(
                ScoreComponents.subject_id == score_component.subject_id,
                ScoreComponents.component_type == score_component.component_type,
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Score conponent already exists.",
            )

        new_score_component = ScoreComponents(**score_component.dict())
        session.add(new_score_component)
        session.commit()
        session.refresh(new_score_component)

        return new_score_component

    @staticmethod
    def update(
        *,
        session: Session,
        score_component_id: uuid.UUID,
        score_component_data: ScoreComponentUpdate,
    ) -> ScoreComponentPublic:
        score_component = session.get(ScoreComponents, score_component_id)
        if not score_component:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Score component not found",
            )

        update_data = score_component_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(score_component, field, value)

        session.commit()

        return ScoreComponentPublic.model_validate(score_component)

    @staticmethod
    def delete(
        *, session: Session, score_component_id: uuid.UUID
    ) -> ScoreComponentDeleteResponse:
        score_component = session.get(ScoreComponents, score_component_id)
        if not score_component:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Score component not found",
            )

        check_related_entities = select(Scores).where(
            Scores.score_component_id == score_component.id
        )
        scores = session.exec(check_related_entities).all()
        if scores:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Score component has related scores and cannot be deleted.",
            )

        if score_component.status == StatusEnum.ACTIVE:
            score_component.status = StatusEnum.INACTIVE
            session.commit()
            return ScoreComponentDeleteResponse(
                id=str(score_component.id), message="Score component set to inactive"
            )

        session.delete(score_component)
        session.commit()

        return ScoreComponentDeleteResponse(
            id=str(score_component.id), message="Score component deleted successfully"
        )
