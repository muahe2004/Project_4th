from io import BytesIO

from fastapi import HTTPException
from fastapi import UploadFile
from openpyxl import load_workbook
from sqlmodel import Session, select
from starlette import status

from app.models.models import (
    Specializations,
    Subjects,
    TrainingProgram,
    TrainingProgramSubject,
)
from app.models.schemas.training_program.training_program_create_schemas import (
    TrainingProgramCreateWithSubjects,
    TrainingProgramSubjectPublic,
    TrainingProgramWithSubjectsPublic,
)
from app.models.schemas.training_program.training_program_file_schemas import (
    TrainingProgramFileData,
    TrainingProgramFileDataResponse,
    TrainingProgramFileInfo,
    TrainingProgramFileInvalidSubject,
    TrainingProgramFileSubjectData,
)


class TrainingProgramServices:
    @staticmethod
    async def upload_file_training_program(
        *, session: Session, file: UploadFile
    ) -> TrainingProgramFileDataResponse:
        filename = file.filename or ""
        if not filename.lower().endswith(".xlsx"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only .xlsx files are supported.",
            )

        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        workbook = load_workbook(BytesIO(content), data_only=True)
        worksheet = workbook.active
        rows = list(worksheet.iter_rows(values_only=True))
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Excel sheet is empty.",
            )

        meta_row_indexes = {
            "program_type": 4,
            "training_program_name": 5,
            "specialization_code": 6,
            "specialization_name": 7,
            "academic_year": 8,
        }
        header_row_index = 10
        table_headers = ["TT", "Mã MH", "Tên MH", "Học kỳ", "Ghi chú"]

        if len(rows) <= header_row_index:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File does not contain the training program table.",
            )

        def cell(row_index: int, col_index: int) -> object | None:
            if row_index >= len(rows):
                return None
            row_values = rows[row_index]
            if row_values is None or col_index >= len(row_values):
                return None
            return row_values[col_index]

        training_program = TrainingProgramFileData(
            program_type=str(cell(meta_row_indexes["program_type"], 2) or "").strip() or None,
            training_program_name=str(cell(meta_row_indexes["training_program_name"], 2) or "").strip() or None,
            specialization_code=str(cell(meta_row_indexes["specialization_code"], 2) or "").strip() or None,
            specialization_name=str(cell(meta_row_indexes["specialization_name"], 2) or "").strip() or None,
            academic_year=str(cell(meta_row_indexes["academic_year"], 2) or "").strip() or None,
        )

        parsed_subjects: list[TrainingProgramFileSubjectData] = []
        invalid_subjects: list[TrainingProgramFileInvalidSubject] = []

        for row_index, row_values in enumerate(rows[header_row_index + 1 :], start=header_row_index + 2):
            if row_values is None:
                continue

            def row_cell(col_index: int) -> object | None:
                if col_index >= len(row_values):
                    return None
                return row_values[col_index]

            subject_code = str(row_cell(1) or "").strip()
            subject_name = str(row_cell(2) or "").strip()
            term_raw = row_cell(3)

            if not any([subject_code, subject_name, term_raw]):
                continue

            errors: list[str] = []
            if not subject_code:
                errors.append("Subject code is required.")
            if not subject_name:
                errors.append("Subject name is required.")
            if term_raw in (None, ""):
                errors.append("Term is required.")

            term_value: int | None = None
            if term_raw not in (None, ""):
                try:
                    term_value = int(term_raw)
                    if term_value < 1:
                        raise ValueError
                except Exception:
                    errors.append("Term must be a positive integer.")

            if errors:
                invalid_subjects.append(
                    TrainingProgramFileInvalidSubject(
                        row=row_index,
                        subject_code=subject_code or None,
                        subject_name=subject_name or None,
                        term=term_value,
                        errors=errors,
                    )
                )
                continue

            parsed_subjects.append(
                TrainingProgramFileSubjectData(
                    subject_code=subject_code,
                    subject_name=subject_name,
                    term=term_value,
                )
            )

        training_program.subjects = parsed_subjects

        return TrainingProgramFileDataResponse(
            file_information=TrainingProgramFileInfo(
                file_name=filename,
                headers=table_headers,
                header_row=header_row_index + 1,
                total_rows=max(len(rows) - (header_row_index + 1), 0),
                valid_rows_count=len(parsed_subjects),
                invalid_rows_count=len(invalid_subjects),
            ),
            training_program=training_program,
            invalid_subjects=invalid_subjects,
        )

    @staticmethod
    def create_with_subjects(
        *, session: Session, payload: TrainingProgramCreateWithSubjects
    ) -> TrainingProgramWithSubjectsPublic:
        specialization = session.exec(
            select(Specializations).where(
                Specializations.specialization_code == payload.specialization_code
            )
        ).first()
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Specialization with code {payload.specialization_code} does not exist.",
            )

        existing_program = session.exec(
            select(TrainingProgram).where(
                TrainingProgram.academic_year == payload.academic_year,
                TrainingProgram.specialization_id == specialization.id,
                TrainingProgram.program_type == payload.program_type,
            )
        ).first()
        if existing_program:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Training program already exists for this specialization, academic year and program type.",
            )

        try:
            program_data = payload.model_dump(
                exclude={"subjects", "specialization_code", "specialization_name"}
            )
            new_program = TrainingProgram(
                **program_data,
                specialization_id=specialization.id,
            )
            session.add(new_program)
            session.flush()

            created_subjects: list[TrainingProgramSubjectPublic] = []
            for index, subject_item in enumerate(payload.subjects, start=1):
                subject = session.exec(
                    select(Subjects).where(
                        Subjects.subject_code == subject_item.subject_code
                    )
                ).first()
                if not subject:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Subject with code {subject_item.subject_code} does not exist.",
                    )

                existing_link = session.exec(
                    select(TrainingProgramSubject).where(
                        TrainingProgramSubject.training_program_id == new_program.id,
                        TrainingProgramSubject.subject_id == subject.id,
                    )
                ).first()
                if existing_link:
                    continue

                new_link = TrainingProgramSubject(
                    training_program_id=new_program.id,
                    subject_id=subject.id,
                    term=subject_item.term or index,
                    status=payload.status,
                )
                session.add(new_link)
                session.flush()
                created_subjects.append(
                    TrainingProgramSubjectPublic(
                        id=new_link.id,
                        training_program_id=new_link.training_program_id,
                        subject_id=new_link.subject_id,
                        term=new_link.term,
                        status=new_link.status,
                    )
                )

            session.commit()

            return TrainingProgramWithSubjectsPublic(
                id=new_program.id,
                program_type=new_program.program_type,
                training_program_name=new_program.training_program_name,
                academic_year=new_program.academic_year,
                specialization_id=new_program.specialization_id,
                status=new_program.status,
                subjects=created_subjects,
            )
        except HTTPException:
            session.rollback()
            raise
        except Exception:
            session.rollback()
            raise
