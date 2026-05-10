import uuid
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.scores.score_schemas import (
    ScoreByClassSubjectParams,
    ScoreByClassSubjectResponse,
    ScoreBulkCreatePayload,
    ScoreBulkCreateResponse,
    ScoreBulkStatusUpdatePayload,
    ScoreBulkStatusUpdateResponse,
    ScoreBulkUpdatePayload,
    ScoreBulkUpdateResponse,
    ScoreFileDataResponse,
    ScoreImportListPayload,
    ScoreImportListResponse,
    StudentAndGpaListResponse,
    StudentAndGpaResponse,
    ScoresPublic,
    ScoresCreate,
    ScoresUpdate,
    ScoresDeleteResponse,
    StudentScoreByStudentResponse,
    StudentScoreFilterParams,
)
from app.services.scores import ScoresServices
from app.models.schemas.students.student_schemas import StudentQueryParams
from typing import List
from fastapi import File, UploadFile

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


# =========================== get student with class and GPA ===========================
@router.get("/student/{student_id}/gpa", response_model=StudentAndGpaResponse)
def get_student_and_gpa(
    session: SessionDep,
    student_id: uuid.UUID,
) -> StudentAndGpaResponse:
    return ScoresServices.get_student_and_gpa(session=session, student_id=student_id)


# =========================== get students with class and GPA ===========================
@router.get("/students/gpa", response_model=StudentAndGpaListResponse)
def get_students_and_gpa(
    session: SessionDep,
    query: StudentQueryParams = Depends(),
) -> StudentAndGpaListResponse:
    return ScoresServices.get_students_and_gpa(session=session, query=query)


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


# =========================== create scores in bulk ===========================
@router.post(
    "/bulk",
    response_model=ScoreBulkCreateResponse,
)
def create_scores_bulk(
    session: SessionDep,
    payload: ScoreBulkCreatePayload,
) -> ScoreBulkCreateResponse:
    return ScoresServices.bulk_create(session=session, payload=payload)


# =========================== update scores in bulk ===========================
@router.patch(
    "/bulk",
    response_model=ScoreBulkUpdateResponse,
)
def update_scores_bulk(
    session: SessionDep,
    payload: ScoreBulkUpdatePayload,
) -> ScoreBulkUpdateResponse:
    return ScoresServices.bulk_update(session=session, payload=payload)


# =========================== activate scores in bulk ===========================
@router.patch(
    "/bulk/status",
    response_model=ScoreBulkStatusUpdateResponse,
)
def activate_scores_bulk(
    session: SessionDep,
    payload: ScoreBulkStatusUpdatePayload,
) -> ScoreBulkStatusUpdateResponse:
    return ScoresServices.bulk_update_status(session=session, payload=payload)


# =========================== upload score file (preview) ===========================
@router.post("/upload-file", response_model=ScoreFileDataResponse)
async def upload_score_file(
    session: SessionDep,
    file: UploadFile = File(...),
) -> ScoreFileDataResponse:
    return await ScoresServices.upload_file_score(session=session, file=file)


# =========================== import score list ===========================
@router.post("/import-list", response_model=ScoreImportListResponse)
def import_score_list(
    session: SessionDep,
    payload: ScoreImportListPayload,
) -> ScoreImportListResponse:
    return ScoresServices.import_score_list(session=session, payload=payload)


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
