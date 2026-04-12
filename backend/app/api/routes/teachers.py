import uuid

from app.services.teachers import TeacherServices
from app.models.schemas.common.query import BaseQueryParams, DateRange
from app.models.schemas.common.query import IdsRequest
from fastapi import APIRouter, Depends, Request, UploadFile, File
from app.api.deps import SessionDep
from app.models.schemas.teachers.teacher_schemas import (
    ListTeacherResponse,
    TeacherCreateResponse,
    TeacherDropdownResponse,
    TeacherPublic,
    TeacherResponse,
    TeacherSearchParams,
    TeacherUpdate,
    TeacherDeleteResponse,
    TeacherCreateWithUserInfor,
    TeacherFileData,
    TeacherFileDataResponse,
    TeacherWithLearningSchedulesResponse,
)

# from app.services.teachers import TeacherServices
from typing import List

router = APIRouter()


# =========================== get all teacheres ===========================
@router.get("", response_model=ListTeacherResponse)
def get_teachers(
    session: SessionDep,
    query: TeacherSearchParams = Depends(),
):
    teachers, total = TeacherServices.get_all(session=session, query=query)
    return ListTeacherResponse(
        data=teachers,
        total=total,
    )

# ===========================  ===========================
@router.get(
    "/with-learning-schedules",
    response_model=TeacherWithLearningSchedulesResponse,
)
def get_teachers_with_learning_schedules(
    session: SessionDep,
    query: BaseQueryParams = Depends(),
    date_range: DateRange = Depends(),
):
    data, total = TeacherServices.get_teacher_and_learning_schedule(
        session=session,
        query=query,
        date_range=date_range,
    )

    return TeacherWithLearningSchedulesResponse(
        data=data,
        total=total
    )


# =========================== GET LIST TEACHERS BY IDS ===========================
@router.post("/list-teacher", response_model=List[TeacherResponse])
def get_teachers_by_ids(
    teacher_ids: List[str], session: SessionDep
) -> List[TeacherResponse]:
    teachers = TeacherServices.get_list_teacher(
        session=session, teacher_ids=teacher_ids
    )
    return [TeacherResponse.model_validate(t) for t in teachers]


# =========================== GET DROPDOWN TEACHERS ===========================
@router.get("/dropdown", response_model=List[TeacherDropdownResponse])
def get_teachers_dropdown(
    session: SessionDep, query: TeacherSearchParams = Depends()
) -> List[TeacherDropdownResponse]:
    return TeacherServices.get_dropdown(session=session, query=query)


# =========================== GET DROPDOWN TEACHERS BY IDS ===========================
@router.post("/dropdown-by-ids", response_model=List[TeacherDropdownResponse])
def get_teachers_dropdown_by_ids(
    session: SessionDep, payload: IdsRequest, request: Request
) -> List[TeacherDropdownResponse]:
    return TeacherServices.get_dropdown_by_ids(
        session=session,
        ids=payload.ids,
        request=request,
    )


# =========================== get teacher by id ===========================
@router.get("/{id}", response_model=TeacherPublic)
def get_teacher_by_id(
    session: SessionDep, id: uuid.UUID, request: Request
) -> TeacherPublic:
    return TeacherServices.get_by_id(session=session, teacher_id=id, request=request)


# =========================== add teacher ===========================
@router.post("", response_model=TeacherCreateResponse)
def create_teacher(
    session: SessionDep, data: TeacherCreateWithUserInfor
) -> TeacherCreateResponse:
    return TeacherServices.create(session=session, teacher=data)


# =========================== update specialization ===========================
@router.patch(
    "/{id}",
    response_model=TeacherPublic,
)
def update_teacher(
    session: SessionDep, id: uuid.UUID, data: TeacherUpdate
) -> TeacherPublic:
    return TeacherServices.update(session=session, teacher_id=id, teacher_data=data)


# =========================== delete specialization ===========================
@router.delete(
    "",
    response_model=List[TeacherDeleteResponse],
)
def delete_multiple_teachers(
    session: SessionDep,
    teacher_ids: List[uuid.UUID],
) -> List[TeacherDeleteResponse]:
    return TeacherServices.delete_many(session=session, teacher_ids=teacher_ids)


@router.post("/upload-file")
async def upload_teacher_file(
    session: SessionDep,
    file: UploadFile = File(...),
) -> TeacherFileDataResponse:
    return await TeacherServices.upload_file_teacher(session=session, file=file)


@router.post("/import-list", response_model=List[TeacherFileData])
def import_list_teacher(
    session: SessionDep,
    list_teacher: List[TeacherFileData],
) -> List[TeacherFileData]:
    return TeacherServices.import_list_teacher(
        session=session,
        list_teacher=list_teacher,
    )
