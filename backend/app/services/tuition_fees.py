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
    TuitionFeeQueryParams,
    TuitionFeeCreate,
    TuitionFeeUpdate,
    TuitionFeeDeleteResponse,
)
from app.enums.status import StatusEnum


class TuitionFeeServices:
    @staticmethod
    def _get_training_program_credit_total(
        *, session: Session, training_program_id: uuid.UUID | None
    ) -> int:
        if not training_program_id:
            return 0

        training_program = session.get(TrainingProgram, training_program_id)
        if not training_program:
            return 0

        credit_rows = session.exec(
            select(Subjects.credit)
            .join(TrainingProgramSubject, TrainingProgramSubject.subject_id == Subjects.id)
            .where(TrainingProgramSubject.training_program_id == training_program_id)
        ).all()

        return sum(credit or 0 for credit in credit_rows)

    @staticmethod
    def _calculate_amount(
        *,
        session: Session,
        training_program_id: uuid.UUID | None,
        price_per_credit: float | None,
    ) -> tuple[int, float]:
        credit_total = TuitionFeeServices._get_training_program_credit_total(
            session=session,
            training_program_id=training_program_id,
        )
        if not training_program_id or price_per_credit is None:
            return 0, 0

        return credit_total, credit_total * price_per_credit

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
                )
            )

        return TuitionFeeListResponse(data=data, total=total)

    @staticmethod
    def get_by_id(
        *, session: Session, request: Request, tuition_fee_id: uuid.UUID
    ) -> TuitionFeePublic:
        tuition_fee = session.get(TuitionFees, tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tuition fee does not exist",
            )
        return TuitionFeePublic.model_validate(tuition_fee)

    @staticmethod
    def create(*, session: Session, tuition_fee: TuitionFeeCreate) -> TuitionFeePublic:
        tuition_fee_payload = tuition_fee.model_dump()
        credit_total, amount = TuitionFeeServices._calculate_amount(
            session=session,
            training_program_id=tuition_fee.training_program_id,
            price_per_credit=tuition_fee.price_per_credit,
        )
        tuition_fee_payload["amount"] = amount

        new_tuition_fee = TuitionFees(**tuition_fee_payload)
        session.add(new_tuition_fee)
        session.commit()
        session.refresh(new_tuition_fee)

        return new_tuition_fee

    @staticmethod
    def create_many(
        *, session: Session, tuition_fees: List[TuitionFeeCreate]
    ) -> List[TuitionFeePublic]:
        if not tuition_fees:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tuition fee list is empty",
            )

        normalized_keys = set()
        for tuition_fee in tuition_fees:
            key = (
                tuition_fee.academic_year,
                tuition_fee.type or "",
                tuition_fee.name or "",
            )
            if key in normalized_keys:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Duplicate tuition fee data in request body.",
                )
            normalized_keys.add(key)

        existing_fees = session.exec(select(TuitionFees)).all()
        existing_keys = {
            (
                tuition_fee.academic_year,
                tuition_fee.type or "",
                tuition_fee.name or "",
            )
            for tuition_fee in existing_fees
        }

        for tuition_fee in tuition_fees:
            key = (
                tuition_fee.academic_year,
                tuition_fee.type or "",
                tuition_fee.name or "",
            )
            if key in existing_keys:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tuition fee {tuition_fee.name} already exists.",
                )

        new_tuition_fees = []
        for tuition_fee in tuition_fees:
            tuition_fee_payload = tuition_fee.model_dump()
            credit_total, amount = TuitionFeeServices._calculate_amount(
                session=session,
                training_program_id=tuition_fee.training_program_id,
                price_per_credit=tuition_fee.price_per_credit,
            )
            tuition_fee_payload["amount"] = amount
            new_tuition_fees.append(TuitionFees(**tuition_fee_payload))
        session.add_all(new_tuition_fees)
        session.commit()
        for tuition_fee in new_tuition_fees:
            session.refresh(tuition_fee)

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
                status_code=status.HTTP_404_NOT_FOUND, detail="Tuition fee not found"
            )

        update_data = tuition_fee_data.model_dump(exclude_unset=True, exclude={"updated_at"})
        for field, value in update_data.items():
            setattr(tuition_fee, field, value)

        credit_total, amount = TuitionFeeServices._calculate_amount(
            session=session,
            training_program_id=tuition_fee.training_program_id,
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
                status_code=status.HTTP_404_NOT_FOUND, detail="Tuition fee not found"
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
