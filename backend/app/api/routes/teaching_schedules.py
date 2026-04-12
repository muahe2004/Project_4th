import uuid

from fastapi import APIRouter, Depends, Request, UploadFile, File
from app.api.deps import SessionDep
from app.models.schemas.common.query import DateRange
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import (
    ImportTeachingCalenderInput,
    ImportTeachingCalenderResponse,
    ListTeachingScheduleResponse,
    TeachingScheduleSearchParams,
    TeachingSchedulPublic,
    TeachingScheduleCreate,
    TeachingScheduleUpdate,
    TeachingScheduleDeleteResponse,
    TeachingScheduleWithLearningSchedulePublic,
    UploadTeachingCalenderResponse,
)
from app.services.teaching_schedules import TeachingScheduleServices

router = APIRouter()


# =========================== get all ===========================
@router.get("", response_model=ListTeachingScheduleResponse)
def get_teaching_schedules(
    session: SessionDep,
    query: TeachingScheduleSearchParams = Depends(),
    date_range: DateRange = Depends(),
) -> ListTeachingScheduleResponse:
    teaching_schedules, total = TeachingScheduleServices.get_all(
        session=session, query=query, date_range=date_range
    )
    return ListTeachingScheduleResponse(data=teaching_schedules, total=total)


# =========================== get by id ===========================
@router.get("/{id}", response_model=TeachingSchedulPublic)
def get_learning_schedules_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> TeachingSchedulPublic:
    return TeachingScheduleServices.get_by_id(
        session=session, teaching_schedule_id=id, request=request
    )


# =========================== add ===========================
@router.post(
    "",
    response_model=TeachingScheduleWithLearningSchedulePublic,
)
def create_department(
    request: Request, session: SessionDep, data: TeachingScheduleCreate
) -> TeachingScheduleWithLearningSchedulePublic:
    return TeachingScheduleServices.create(session=session, teaching_schedule=data)


# =========================== update ===========================
@router.patch(
    "/{id}",
    response_model=TeachingSchedulPublic,
)
def update_teaching_schedules(
    session: SessionDep, id: uuid.UUID, data: TeachingScheduleUpdate
) -> TeachingSchedulPublic:
    return TeachingScheduleServices.update(
        session=session, teaching_schedule_id=id, teaching_schedules_data=data
    )


# =========================== delete ===========================
@router.delete(
    "/{id}",
    response_model=TeachingScheduleDeleteResponse,
)
def delete_teaching_schedule(
    session: SessionDep, id: uuid.UUID
) -> TeachingScheduleDeleteResponse:
    return TeachingScheduleServices.delete(session=session, teaching_schedule_id=id)


@router.post("/upload-file", response_model=UploadTeachingCalenderResponse)
async def upload_teaching_calender_file(
    session: SessionDep,
    file: UploadFile = File(...),
) -> UploadTeachingCalenderResponse:
    return await TeachingScheduleServices.upload_file_calender(session=session, file=file)


@router.post("/import-calender", response_model=ImportTeachingCalenderResponse)
def import_teaching_calender(
    request: Request,
    session: SessionDep,
    calender: ImportTeachingCalenderInput,
) -> ImportTeachingCalenderResponse:
    return TeachingScheduleServices.import_calender(
        session=session,
        request=request,
        calender=calender,
    )
