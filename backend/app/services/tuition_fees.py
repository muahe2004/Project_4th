from datetime import datetime
import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, select, func, desc, or_
from starlette import status
from typing import List

from app.models.models import (
    TuitionFees,
    TrainingProgram,
    TrainingProgramSubject,
    Subjects,
    Specializations,
    Majors,
    Departments,
)
from app.models.schemas.tuition_fees.tuition_fee_schemas import (
    TuitionFeePublic,
    TuitionFeeListResponse,
    TuitionFeePublicDetail,
    TuitionFeeTrainingProgramInfo,
    TuitionFeeSpecializationInfo,
    TuitionFeeMajorInfo,
    TuitionFeeDepartmentInfo,
    TuitionFeeSubjectInfo,
    TuitionFeeQueryParams,
    TuitionFeeCreate,
    TuitionFeeUpdate,
    TuitionFeeDeleteResponse,
)
from app.enums.status import StatusEnum


class TuitionFeeServices:
    ERR_INVALID_ACADEMIC_YEAR_FORMAT = "tuition_fees.errors.invalid_academic_year_format"
    ERR_INVALID_ACADEMIC_YEAR_RANGE = "tuition_fees.errors.invalid_academic_year_range"
    ERR_CURRENT_DATE_OUTSIDE_ACADEMIC_YEAR = "tuition_fees.errors.current_date_outside_academic_year"
    ERR_DEPARTMENT_NOT_FOUND = "tuition_fees.errors.department_not_found"
    ERR_DEPARTMENT_NO_MAJORS = "tuition_fees.errors.department_has_no_majors"
    ERR_DEPARTMENT_NO_SPECIALIZATIONS = "tuition_fees.errors.department_has_no_specializations"
    ERR_NO_ELIGIBLE_TRAINING_PROGRAMS = "tuition_fees.errors.no_eligible_training_programs"
    ERR_DUPLICATE_CREATE = "tuition_fees.errors.duplicate_records"
    ERR_EMPTY_CREATE_LIST = "tuition_fees.errors.empty_create_list"
    ERR_NOT_FOUND = "tuition_fees.errors.not_found"
    ERR_TRAINING_PROGRAM_NOT_FOUND = "tuition_fees.errors.training_program_not_found"
    ERR_SPECIALIZATION_NOT_FOUND = "tuition_fees.errors.specialization_not_found"
    ERR_MAJOR_NOT_FOUND = "tuition_fees.errors.major_not_found"
    ERR_INVALID_DATE_RANGE = "tuition_fees.errors.invalid_date_range"

    @staticmethod
    def _validate_date_range(*, start_date: datetime | None, end_date: datetime | None) -> None:
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_INVALID_DATE_RANGE,
            )
    @staticmethod
    def _parse_academic_year(academic_year: str) -> tuple[int, int]:
        parts = [part.strip() for part in academic_year.split("-")]
        if len(parts) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_INVALID_ACADEMIC_YEAR_FORMAT,
            )

        try:
            start_year = int(parts[0])
            end_year = int(parts[1])
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_INVALID_ACADEMIC_YEAR_FORMAT,
            ) from exc

        if end_year < start_year:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_INVALID_ACADEMIC_YEAR_RANGE,
            )

        return start_year, end_year

    @staticmethod
    def _is_current_or_future_academic_year(academic_year: str) -> bool:
        _, end_year = TuitionFeeServices._parse_academic_year(academic_year)
        current_year = datetime.now().year
        return end_year >= current_year

    @staticmethod
    def _get_current_tuition_academic_year(
        current_date: datetime | None = None,
    ) -> str:
        current_date = current_date or datetime.now()
        next_year = current_date.year + 1
        return f"{current_date.year} - {next_year}"

    @staticmethod
    def _get_current_term_for_academic_year(
        *, academic_year: str, current_date: datetime | None = None
    ) -> int:
        current_date = current_date or datetime.now()
        start_year, end_year = TuitionFeeServices._parse_academic_year(academic_year)

        if not (start_year <= current_date.year <= end_year):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_CURRENT_DATE_OUTSIDE_ACADEMIC_YEAR,
            )

        term = max(2, (current_date.year - start_year) * 2)
        if term > 8:
            term = 8
        return term

    @staticmethod
    def _create_for_department(
        *, session: Session, tuition_fee: TuitionFeeCreate
    ) -> list[TuitionFees]:
        TuitionFeeServices._validate_date_range(
            start_date=tuition_fee.start_date,
            end_date=tuition_fee.end_date,
        )
        department = session.get(Departments, tuition_fee.department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_DEPARTMENT_NOT_FOUND,
            )

        major_ids = session.exec(
            select(Majors.id).where(Majors.department_id == department.id)
        ).all()
        if not major_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_DEPARTMENT_NO_MAJORS,
            )

        specialization_ids = session.exec(
            select(Specializations.id).where(Specializations.major_id.in_(major_ids))
        ).all()
        if not specialization_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_DEPARTMENT_NO_SPECIALIZATIONS,
            )

        training_programs = session.exec(
            select(TrainingProgram).where(
                TrainingProgram.specialization_id.in_(specialization_ids)
            )
        ).all()

        eligible_programs = [
            program
            for program in training_programs
            if TuitionFeeServices._is_current_or_future_academic_year(program.academic_year)
        ]
        if not eligible_programs:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_NO_ELIGIBLE_TRAINING_PROGRAMS,
            )

        created_fees: list[TuitionFees] = []
        for program in eligible_programs:
            term = TuitionFeeServices._get_current_term_for_academic_year(
                academic_year=program.academic_year
            )
            existing_fee = session.exec(
                select(TuitionFees).where(
                    TuitionFees.training_program_id == program.id,
                    TuitionFees.term == term,
                    TuitionFees.academic_year == tuition_fee.academic_year,
                    TuitionFees.name == tuition_fee.name,
                    TuitionFees.type == tuition_fee.type,
                )
            ).first()
            if existing_fee:
                continue

            tuition_fee_payload = tuition_fee.model_dump(exclude={"department_id", "academic_year"})
            tuition_fee_payload["training_program_id"] = program.id
            tuition_fee_payload["term"] = term
            tuition_fee_payload["academic_year"] = TuitionFeeServices._get_current_tuition_academic_year()
            _, amount = TuitionFeeServices._calculate_amount(
                session=session,
                training_program_id=program.id,
                term=term,
                price_per_credit=tuition_fee.price_per_credit,
            )
            tuition_fee_payload["amount"] = amount

            new_tuition_fee = TuitionFees(**tuition_fee_payload)
            session.add(new_tuition_fee)
            created_fees.append(new_tuition_fee)

        if not created_fees:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_DUPLICATE_CREATE,
            )

        session.commit()
        for new_tuition_fee in created_fees:
            session.refresh(new_tuition_fee)

        return created_fees

    @staticmethod
    def _build_subject_info(
        *, session: Session, training_program_id: uuid.UUID | None, term: int | None
    ) -> list[TuitionFeeSubjectInfo]:
        if not training_program_id or term is None:
            return []

        subject_statement = (
            select(Subjects.id, Subjects.subject_code, Subjects.name, Subjects.credit)
            .join(
                TrainingProgramSubject,
                TrainingProgramSubject.subject_id == Subjects.id,
            )
            .where(TrainingProgramSubject.training_program_id == training_program_id)
            .where(TrainingProgramSubject.term == term)
        )
        subject_rows = session.exec(subject_statement).all()
        return [
            TuitionFeeSubjectInfo(
                subject_id=subject_row[0],
                subject_code=subject_row[1],
                subject_name=subject_row[2],
                subject_credit=subject_row[3],
            )
            for subject_row in subject_rows
        ]

    @staticmethod
    def _get_training_program_credit_total(
        *,
        session: Session,
        training_program_id: uuid.UUID | None,
        term: int | None = None,
    ) -> int:
        if not training_program_id:
            return 0

        training_program = session.get(TrainingProgram, training_program_id)
        if not training_program:
            return 0

        statement = (
            select(Subjects.credit)
            .join(TrainingProgramSubject, TrainingProgramSubject.subject_id == Subjects.id)
            .where(TrainingProgramSubject.training_program_id == training_program_id)
        )
        if term is not None:
            statement = statement.where(TrainingProgramSubject.term == term)

        credit_rows = session.exec(statement).all()

        return sum(credit or 0 for credit in credit_rows)

    @staticmethod
    def _calculate_amount(
        *,
        session: Session,
        training_program_id: uuid.UUID | None,
        term: int | None,
        price_per_credit: float | None,
    ) -> tuple[int, float]:
        credit_total = TuitionFeeServices._get_training_program_credit_total(
            session=session,
            training_program_id=training_program_id,
            term=term,
        )
        if price_per_credit is None:
            return 0, 0

        if training_program_id and term is not None:
            return credit_total, credit_total * price_per_credit

        return credit_total, credit_total * price_per_credit

    @staticmethod
    def _should_recalculate_amount(update_data: dict) -> bool:
        return any(
            field in update_data
            for field in ("training_program_id", "term", "price_per_credit")
        )

    @staticmethod
    def get_all(
        *, session: Session, query: TuitionFeeQueryParams
    ) -> TuitionFeeListResponse:
        statement = (
            select(
                TuitionFees,
                TrainingProgram.program_type,
                TrainingProgram.training_program_name,
                TrainingProgram.academic_year,
                Specializations.id,
                Specializations.specialization_code,
                Specializations.name,
                Majors.id,
                Majors.major_code,
                Majors.name,
                Departments.id,
                Departments.department_code,
                Departments.name,
            )
            .join(TrainingProgram, TrainingProgram.id == TuitionFees.training_program_id)
            .join(Specializations, Specializations.id == TrainingProgram.specialization_id)
            .join(Majors, Majors.id == Specializations.major_id)
            .join(Departments, Departments.id == Majors.department_id)
        )

        conditions = []
        if query.training_program_id:
            conditions.append(TuitionFees.training_program_id == query.training_program_id)
        if query.specialization_id:
            conditions.append(TrainingProgram.specialization_id == query.specialization_id)
        if query.major_id:
            conditions.append(Majors.id == query.major_id)
        if query.department_id:
            conditions.append(Departments.id == query.department_id)
        if query.status:
            conditions.append(TuitionFees.status == query.status)
        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    TuitionFees.name.ilike(search_pattern),
                    TuitionFees.type.ilike(search_pattern),
                    TrainingProgram.program_type.ilike(search_pattern),
                    TrainingProgram.training_program_name.ilike(search_pattern),
                    Specializations.name.ilike(search_pattern),
                    Majors.name.ilike(search_pattern),
                    Departments.name.ilike(search_pattern),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        total = session.exec(select(func.count()).select_from(statement.subquery())).one()
        statement = statement.order_by(desc(TuitionFees.created_at))
        statement = statement.offset(query.skip).limit(query.limit)
        rows = session.exec(statement).all()

        data = []
        for row in rows:
            fee = row[0]
            subject_info = TuitionFeeServices._build_subject_info(
                session=session,
                training_program_id=fee.training_program_id,
                term=fee.term,
            )
            training_program_info = TuitionFeeTrainingProgramInfo(
                id=fee.training_program_id,
                program_type=row[1],
                training_program_name=row[2],
                academic_year=row[3],
            )
            specialization_info = TuitionFeeSpecializationInfo(
                id=row[4],
                specialization_code=row[5],
                specialization_name=row[6],
            )
            major_info = TuitionFeeMajorInfo(
                id=row[7],
                major_code=row[8],
                major_name=row[9],
            )
            department_info = TuitionFeeDepartmentInfo(
                id=row[10],
                department_code=row[11],
                department_name=row[12],
            )
            data.append(
                TuitionFeePublicDetail(
                    **fee.model_dump(),
                    training_program_info=training_program_info,
                    specialization_infor=specialization_info,
                    major_infor=major_info,
                    department_info=department_info,
                    subject_info=subject_info,
                )
            )

        return TuitionFeeListResponse(data=data, total=total)

    @staticmethod
    def get_by_id(
        *, session: Session, request: Request, tuition_fee_id: uuid.UUID
    ) -> TuitionFeePublicDetail:
        tuition_fee = session.get(TuitionFees, tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_NOT_FOUND,
            )
        training_program = session.get(TrainingProgram, tuition_fee.training_program_id)
        if not training_program:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_TRAINING_PROGRAM_NOT_FOUND,
            )

        specialization = session.get(Specializations, training_program.specialization_id)
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_SPECIALIZATION_NOT_FOUND,
            )

        major = session.get(Majors, specialization.major_id)
        if not major:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_MAJOR_NOT_FOUND,
            )

        department = session.get(Departments, major.department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_DEPARTMENT_NOT_FOUND,
            )

        return TuitionFeePublicDetail(
            **tuition_fee.model_dump(),
            training_program_info=TuitionFeeTrainingProgramInfo(
                id=tuition_fee.training_program_id,
                program_type=training_program.program_type,
                training_program_name=training_program.training_program_name,
                academic_year=training_program.academic_year,
            ),
            specialization_infor=TuitionFeeSpecializationInfo(
                id=specialization.id,
                specialization_code=specialization.specialization_code,
                specialization_name=specialization.name,
            ),
            major_infor=TuitionFeeMajorInfo(
                id=major.id,
                major_code=major.major_code,
                major_name=major.name,
            ),
            department_info=TuitionFeeDepartmentInfo(
                id=department.id,
                department_code=department.department_code,
                department_name=department.name,
            ),
            subject_info=TuitionFeeServices._build_subject_info(
                session=session,
                training_program_id=tuition_fee.training_program_id,
                term=tuition_fee.term,
            ),
        )

    @staticmethod
    def create(*, session: Session, tuition_fee: TuitionFeeCreate) -> TuitionFeePublic:
        created_fees = TuitionFeeServices._create_for_department(
            session=session, tuition_fee=tuition_fee
        )
        return created_fees[0]

    @staticmethod
    def create_many(
        *, session: Session, tuition_fees: List[TuitionFeeCreate]
    ) -> List[TuitionFeePublic]:
        if not tuition_fees:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=TuitionFeeServices.ERR_EMPTY_CREATE_LIST,
            )

        new_tuition_fees: list[TuitionFees] = []
        for tuition_fee in tuition_fees:
            new_tuition_fees.extend(
                TuitionFeeServices._create_for_department(session=session, tuition_fee=tuition_fee)
            )

        return new_tuition_fees

    @staticmethod
    def update(
        *,
        session: Session,
        tuition_fee_id: uuid.UUID,
        tuition_fee_data: TuitionFeeUpdate,
    ) -> TuitionFeePublic:
        tuition_fee = session.get(TuitionFees, tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_NOT_FOUND,
            )

        update_data = tuition_fee_data.model_dump(exclude_unset=True, exclude={"updated_at"})
        next_start_date = update_data.get("start_date", tuition_fee.start_date)
        next_end_date = update_data.get("end_date", tuition_fee.end_date)
        TuitionFeeServices._validate_date_range(
            start_date=next_start_date,
            end_date=next_end_date,
        )

        for field, value in update_data.items():
            setattr(tuition_fee, field, value)

        if TuitionFeeServices._should_recalculate_amount(update_data):
            _, amount = TuitionFeeServices._calculate_amount(
                session=session,
                training_program_id=tuition_fee.training_program_id,
                term=tuition_fee.term,
                price_per_credit=tuition_fee.price_per_credit,
            )
            tuition_fee.amount = amount
        tuition_fee.updated_at = datetime.now()

        session.commit()
        session.refresh(tuition_fee)

        return TuitionFeePublic.model_validate(tuition_fee)

    @staticmethod
    def delete(
        *, session: Session, tuition_fee_id: uuid.UUID
    ) -> TuitionFeeDeleteResponse:
        tuition_fee = session.get(TuitionFees, tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TuitionFeeServices.ERR_NOT_FOUND,
            )

        # check relations

        if tuition_fee.status == StatusEnum.ACTIVE:
            tuition_fee.status = StatusEnum.INACTIVE
            tuition_fee.updated_at = datetime.now()
            session.commit()
            return TuitionFeeDeleteResponse(
                id=str(tuition_fee.id), message="Tuition fee set to inactive"
            )

        return TuitionFeeDeleteResponse(
            id=str(tuition_fee.id), message="Tuition fee already inactive"
        )
