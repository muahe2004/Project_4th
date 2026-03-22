import uuid
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.scores.score_schemas import (
    ScoreByClassSubjectParams,
    ScoreByClassSubjectResponse,
    ScoresPublic,
    ScoresCreate,
    ScoresUpdate,
    ScoresDeleteResponse,
    StudentScoreByStudentResponse,
    StudentScoreFilterParams,
)
from app.services.scores import ScoresServices
from typing import List

router = APIRouter()


# # =========================== get all score ===========================
@router.get("", response_model=List[ScoresPublic])
def get_scores(session: SessionDep) -> List[ScoresPublic]:
    return ScoresServices.get_all(session=session)


# =========================== get score by class + subject ===========================
@router.get("/class-subject", response_model=ScoreByClassSubjectResponse)
def get_scores_by_class_subject(
    session: SessionDep,
    query: ScoreByClassSubjectParams = Depends(),
) -> ScoreByClassSubjectResponse:
    return ScoresServices.get_by_class_subject(session=session, query=query)


# =========================== get score by student ===========================
@router.get("/student/{student_id}", response_model=StudentScoreByStudentResponse)
def get_scores_by_student(
    session: SessionDep,
    student_id: uuid.UUID,
    query: StudentScoreFilterParams = Depends(),
) -> StudentScoreByStudentResponse:
    return ScoresServices.get_by_student(
        session=session,
        student_id=student_id,
        query=query,
    )


# =========================== get score by id ===========================
@router.get("/{id}", response_model=ScoresPublic)
def get_score_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> ScoresPublic:
    return ScoresServices.get_by_id(session=session, score_id=id, request=request)


# =========================== create score ===========================
@router.post(
    "",
    response_model=ScoresPublic,
)
def create_score(
    request: Request, session: SessionDep, data: ScoresCreate
) -> ScoresPublic:
    return ScoresServices.create(session=session, score=data)


# =========================== update score ===========================
@router.patch(
    "/{id}",
    response_model=ScoresPublic,
)
def update_score(
    session: SessionDep, id: uuid.UUID, data: ScoresUpdate
) -> ScoresPublic:
    return ScoresServices.update(session=session, score_id=id, score_data=data)


# # =========================== delete score ===========================
@router.delete(
    "/{id}",
    response_model=ScoresDeleteResponse,
)
def delete_score(session: SessionDep, id: uuid.UUID) -> ScoresDeleteResponse:
    return ScoresServices.delete(session=session, score_id=id)
