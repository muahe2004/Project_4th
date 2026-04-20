from fastapi import APIRouter, Depends, File, UploadFile
import uuid

from app.api.deps import SessionDep
from app.models.schemas.common.query import IdsRequest
from app.models.schemas.training_program.training_program_create_schemas import (
    TrainingProgramCreateWithSubjects,
    TrainingProgramDeleteResponse,
    TrainingProgramDropDownResponse,
    TrainingProgramListResponse,
    TrainingProgramWithSubjectsPublic,
    TrainingProgramQueryParams,
    TrainingProgramUpdateResponse,
    TrainingProgramUpdateWithSubjects,
)
from app.models.schemas.training_program.training_program_file_schemas import (
    TrainingProgramFileDataResponse,
)
from app.services.training_programs import TrainingProgramServices

router = APIRouter()


@router.get("", response_model=TrainingProgramListResponse)
def get_training_programs(
    session: SessionDep, query: TrainingProgramQueryParams = Depends()
) -> TrainingProgramListResponse:
    return TrainingProgramServices.get_training_programs(session=session, query=query)


@router.get("/dropdown", response_model=list[TrainingProgramDropDownResponse])
def get_training_programs_dropdown(
    session: SessionDep, query: TrainingProgramQueryParams = Depends()
) -> list[TrainingProgramDropDownResponse]:
    return TrainingProgramServices.get_dropdown(session=session, query=query)


@router.post("/dropdown-by-ids", response_model=list[TrainingProgramDropDownResponse])
def get_training_programs_dropdown_by_ids(
    session: SessionDep, payload: IdsRequest
) -> list[TrainingProgramDropDownResponse]:
    return TrainingProgramServices.get_dropdown_by_ids(session=session, ids=payload.ids)


@router.post("/upload-file", response_model=TrainingProgramFileDataResponse)
async def upload_training_program_file(
    session: SessionDep,
    file: UploadFile = File(...),
) -> TrainingProgramFileDataResponse:
    return await TrainingProgramServices.upload_file_training_program(
        session=session,
        file=file,
    )


@router.post("", response_model=TrainingProgramWithSubjectsPublic)
def create_training_program_with_subjects(
    session: SessionDep,
    data: TrainingProgramCreateWithSubjects,
) -> TrainingProgramWithSubjectsPublic:
    return TrainingProgramServices.create_with_subjects(session=session, payload=data)


@router.patch("/{id}", response_model=TrainingProgramUpdateResponse)
def update_training_program_with_subjects(
    session: SessionDep,
    id: uuid.UUID,
    data: TrainingProgramUpdateWithSubjects,
) -> TrainingProgramUpdateResponse:
    return TrainingProgramServices.update_with_subjects(
        session=session,
        training_program_id=id,
        payload=data,
    )


@router.delete("/{id}", response_model=TrainingProgramDeleteResponse)
def delete_training_program(
    session: SessionDep,
    id: uuid.UUID,
) -> TrainingProgramDeleteResponse:
    return TrainingProgramServices.delete(session=session, training_program_id=id)
