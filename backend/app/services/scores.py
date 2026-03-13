import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Scores
from app.models.schemas.scores.score_schemas import (
    ScoresPublic,
    ScoresCreate,
    ScoresUpdate,
    ScoresDeleteResponse,
)
from app.enums.status import StatusEnum


class ScoresServices:
    @staticmethod
    def get_all(
        *,
        session: Session,
    ) -> List[ScoresPublic]:
        scores = session.exec(select(Scores)).all()
        return scores

    @staticmethod
    def get_by_id(
        *, session: Session, score_id: uuid.UUID, request: Request
    ) -> ScoresPublic:
        score = session.get(Scores, score_id)
        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Score does not exist"
            )
        return ScoresPublic.model_validate(score)

    @staticmethod
    def create(
        *,
        session: Session,
        score: ScoresCreate,
    ) -> ScoresPublic:
        existing = session.exec(
            select(Scores).where(
                Scores.student_id == score.student_id,
                Scores.score_component_id == score.score_component_id,
                Scores.attempt == score.attempt,
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Score already exists.",
            )

        new_score = Scores(**score.dict())
        session.add(new_score)
        session.commit()
        session.refresh(new_score)

        return new_score

    @staticmethod
    def update(
        *, session: Session, score_id: uuid.UUID, score_data: ScoresUpdate
    ) -> ScoresPublic:
        score = session.get(Scores, score_id)
        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Score not found"
            )

        update_data = score_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(score, field, value)

        session.commit()

        return ScoresPublic.model_validate(score)

    @staticmethod
    def delete(*, session: Session, score_id: uuid.UUID) -> ScoresDeleteResponse:
        score = session.get(Scores, score_id)
        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Score not found"
            )

        if score.status == StatusEnum.ACTIVE:
            score.status = StatusEnum.INACTIVE
            session.commit()
            return ScoresDeleteResponse(
                id=str(score.id), message="Score set to inactive"
            )

        session.delete(score)
        session.commit()

        return ScoresDeleteResponse(
            id=str(score.id), message="Score deleted successfully"
        )
