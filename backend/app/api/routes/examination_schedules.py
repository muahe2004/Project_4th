import uuid

from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.common.query import DateRange
from app.models.schemas.examination_schedules.examination_schedule_schemas import (
    ExaminationSchedulePublic,
    ExaminationScheduleCreate,
    ExaminationScheduleUpdate,
    ExaminationScheduleDeleteResponse,
    ExaminationScheduleResponse,
    ListExaminationScheduleResponse,
    ExaminationScheduleQueryParams,
    UploadExaminationScheduleResponse,
    ImportExaminationScheduleInput,
    ImportExaminationScheduleResponse,
)
from app.services.examination_schedules import ExaminationScheduleServices
from fastapi import File, UploadFile

router = APIRouter()


# =========================== get all ===========================
@router.get("", response_model=ListExaminationScheduleResponse)
def get_examination_schedules(
    session: SessionDep,
    query: ExaminationScheduleQueryParams = Depends(),
    date_range: DateRange = Depends(),
) -> ListExaminationScheduleResponse:
    data, total = ExaminationScheduleServices.get_all(
        session=session,
        query=query,
        date_range=date_range,
    )
    return ListExaminationScheduleResponse(data=data, total=total)


# =========================== get by id ===========================
@router.get("/{id}", response_model=ExaminationScheduleResponse)
def get_examination_schedules_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> ExaminationScheduleResponse:
    return ExaminationScheduleServices.get_by_id(
        session=session, examination_schedules_id=id, request=request
    )


# =========================== add ===========================
@router.post(
    "",
    response_model=ExaminationSchedulePublic,
)
def create_examination_schedule(
    request: Request, session: SessionDep, data: ExaminationScheduleCreate
) -> ExaminationSchedulePublic:
    return ExaminationScheduleServices.create(
        session=session, examination_schedule=data
    )


# =========================== update ===========================
@router.patch(
    "/{id}",
    response_model=ExaminationSchedulePublic,
)
def update_examination_schedules(
    session: SessionDep, id: uuid.UUID, data: ExaminationScheduleUpdate
) -> ExaminationSchedulePublic:
    return ExaminationScheduleServices.update(
        session=session, examination_schedule_id=id, examination_schedule_data=data
    )


# =========================== delete ===========================
@router.delete(
    "/{id}",
    response_model=ExaminationScheduleDeleteResponse,
)
def delete_learning_schedule(
    session: SessionDep, id: uuid.UUID
) -> ExaminationScheduleDeleteResponse:
    return ExaminationScheduleServices.delete(
        session=session, examination_schedule_id=id
    )


@router.post("/upload-file", response_model=UploadExaminationScheduleResponse)
async def upload_examination_schedule_file(
    session: SessionDep,
    file: UploadFile = File(...),
) -> UploadExaminationScheduleResponse:
    return await ExaminationScheduleServices.upload_file_examination_schedule(
        session=session,
        file=file,
    )


@router.post("/import-file", response_model=ImportExaminationScheduleResponse)
def import_examination_schedule_file(
    session: SessionDep,
    calender: ImportExaminationScheduleInput,
) -> ImportExaminationScheduleResponse:
    return ExaminationScheduleServices.import_examination_schedule(
        session=session,
        calender=calender,
    )
