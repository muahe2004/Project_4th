import uuid
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy import or_
from starlette import status

from app.models.models import (
    Classes,
    Departments,
    Majors,
    Specializations,
    StudentClass,
    StudentTuitionFees,
    Students,
    TuitionFees,
    TrainingProgram,
)
from app.models.schemas.tuition_fees.student_tuition_fee_schemas import (
    StudentTuitionFeeBulkCreateRequest,
    StudentTuitionFeeBulkCreateResponse,
    StudentTuitionFeeCreate,
    StudentTuitionFeePublic,
)
from app.enums.status import StatusEnum
from app.services.students import StudentServices


class StudentTuitionFeeServices:
    @staticmethod
    def _calculate_amounts(
        *, tuition_amount: float, reduction: float | None, paid_amount: float | None
    ) -> tuple[float, float, float]:
        reduction_value = reduction or 0
        payable_amount = max(tuition_amount - reduction_value, 0)
        paid_value = paid_amount or 0

        if paid_value > payable_amount:
            return payable_amount, 0, paid_value - payable_amount

        return payable_amount, payable_amount - paid_value, 0

    @staticmethod
    def create(
        *, session: Session, student_tuition_fee: StudentTuitionFeeCreate
    ) -> StudentTuitionFeePublic:
        student = session.get(Students, student_tuition_fee.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student does not exist",
            )

        tuition_fee = session.get(TuitionFees, student_tuition_fee.tuition_fee_id)
        if not tuition_fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tuition fee does not exist",
            )

        duplicate = session.exec(
            select(StudentTuitionFees).where(
                StudentTuitionFees.student_id == student_tuition_fee.student_id,
                StudentTuitionFees.tuition_fee_id == student_tuition_fee.tuition_fee_id,
            )
        ).first()
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student tuition fee already exists",
            )

        payable_amount, debt_amount, surplus = StudentTuitionFeeServices._calculate_amounts(
            tuition_amount=tuition_fee.amount,
            reduction=student_tuition_fee.reduction,
            paid_amount=student_tuition_fee.paid_amount,
        )

        payload = student_tuition_fee.model_dump()
        payload["payable_amount"] = payable_amount
        payload["debt_amount"] = debt_amount
        payload["surplus"] = surplus

        record = StudentTuitionFees(**payload)
        session.add(record)
        session.commit()
        session.refresh(record)
        return StudentTuitionFeePublic.model_validate(record)

    @staticmethod
    def create_many_by_tuition_fee(
        *,
        session: Session,
        payload: StudentTuitionFeeBulkCreateRequest,
    ) -> StudentTuitionFeeBulkCreateResponse:
        if not payload.department_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="department_ids is empty",
            )

        departments = session.exec(
            select(Departments).where(Departments.id.in_(payload.department_ids))
        ).all()
        if not departments:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department does not exist",
            )

        department_ids = [department.id for department in departments]
        tuition_fee_rows = session.exec(
            select(TuitionFees, Majors.id)
            .join(TrainingProgram, TrainingProgram.id == TuitionFees.training_program_id)
            .join(Specializations, Specializations.id == TrainingProgram.specialization_id)
            .join(Majors, Majors.id == Specializations.major_id)
            .where(Majors.department_id.in_(department_ids))
        ).all()
        if not tuition_fee_rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected departments do not have tuition fees",
            )

        tuition_fee_map: dict[tuple[uuid.UUID, int], list[uuid.UUID]] = {}
        tuition_fee_ids: list[uuid.UUID] = []
        for tuition_fee, major_id in tuition_fee_rows:
            if tuition_fee.term is None:
                continue
            tuition_fee_map.setdefault((major_id, tuition_fee.term), []).append(
                tuition_fee.id
            )
            tuition_fee_ids.append(tuition_fee.id)

        if not tuition_fee_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected departments do not have matching tuition fee terms",
            )

        student_rows = session.exec(
            select(
                Students.id,
                Students.course,
                Classes.id,
                Majors.id,
            )
            .join(StudentClass, StudentClass.student_id == Students.id)
            .join(Classes, Classes.id == StudentClass.class_id)
            .join(Specializations, Specializations.id == Classes.specialization_id)
            .join(Majors, Majors.id == Specializations.major_id)
            .where(
                Majors.department_id.in_(department_ids),
                or_(
                    StudentClass.status == StatusEnum.ACTIVE,
                    StudentClass.status.is_(None),
                ),
            )
        ).all()

        if not student_rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected departments do not have students with classes",
            )

        student_ids = [row[0] for row in student_rows]
        existing_pairs = session.exec(
            select(StudentTuitionFees.student_id, StudentTuitionFees.tuition_fee_id).where(
                StudentTuitionFees.student_id.in_(student_ids),
                StudentTuitionFees.tuition_fee_id.in_(tuition_fee_ids),
            )
        ).all()
        existing_pair_set = {(student_id, tuition_fee_id) for student_id, tuition_fee_id in existing_pairs}

        matched_records: list[tuple[uuid.UUID, uuid.UUID]] = []
        skipped_no_class = 0
        skipped_no_term_match = 0
        skipped_no_specialization_match = 0
        skipped_no_major_match = 0
        skipped_duplicate = 0

        for student_id, course, _class_id, major_id in student_rows:
            student_term = StudentServices.get_student_term(course or "")
            if student_term is None:
                skipped_no_term_match += 1
                continue

            matched_fee_ids = tuition_fee_map.get((major_id, student_term))
            if not matched_fee_ids:
                skipped_no_term_match += 1
                continue

            for tuition_fee_id in matched_fee_ids:
                if (student_id, tuition_fee_id) in existing_pair_set:
                    skipped_duplicate += 1
                    continue
                matched_records.append((student_id, tuition_fee_id))

        new_records: list[StudentTuitionFees] = []
        for student_id, tuition_fee_id in matched_records:
            tuition_fee = session.get(TuitionFees, tuition_fee_id)
            if not tuition_fee:
                continue

            payable_amount, debt_amount, surplus = StudentTuitionFeeServices._calculate_amounts(
                tuition_amount=tuition_fee.amount,
                reduction=payload.reduction,
                paid_amount=payload.paid_amount,
            )
            record = StudentTuitionFees(
                student_id=student_id,
                tuition_fee_id=tuition_fee.id,
                reduction=payload.reduction,
                payable_amount=payable_amount,
                paid_amount=payload.paid_amount,
                debt_amount=debt_amount,
                surplus=surplus,
            )
            session.add(record)
            new_records.append(record)

        if new_records:
            session.commit()
            for record in new_records:
                session.refresh(record)

        return StudentTuitionFeeBulkCreateResponse(
            department_ids=department_ids,
            matched_students=len(matched_records),
            created_records=len(new_records),
            skipped_no_class=skipped_no_class,
            skipped_no_term_match=skipped_no_term_match,
            skipped_no_specialization_match=skipped_no_specialization_match,
            skipped_no_major_match=skipped_no_major_match,
            skipped_duplicate=skipped_duplicate,
        )
