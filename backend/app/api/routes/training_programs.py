from fastapi import APIRouter, File, UploadFile

from app.api.deps import SessionDep
from app.models.schemas.training_program.training_program_create_schemas import (
    TrainingProgramCreateWithSubjects,
    TrainingProgramWithSubjectsPublic,
)
from app.models.schemas.training_program.training_program_file_schemas import (
    TrainingProgramFileDataResponse,
)
from app.services.training_programs import TrainingProgramServices

router = APIRouter()


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
