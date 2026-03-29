import uuid
from app.models.schemas.common.query import BaseQueryParams
from fastapi import HTTPException, Request
from sqlmodel import Session, select, or_, func, desc
from starlette import status
from typing import List, Tuple

from app.models.models import Subjects
from app.models.schemas.subjects.subject_schemas import (
    SubjectPublic,
    SubjectCreate,
    SubjectUpdate,
    SubjectDeleteResponse,
    SubjectDropdownResponse,
)
from app.enums.status import StatusEnum
from app.models.models import LearningSchedules
from app.models.models import ExaminationSchedules


class SubjectServices:
    @staticmethod
    def get_all(
        *, session: Session, query: BaseQueryParams
    ) -> Tuple[List[SubjectPublic], int]:
        statement = select(Subjects)

        conditions = []
        if query.status:
            conditions.append(Subjects.status == query.status)

        if query.search:
            conditions.append(
                or_(
                    Subjects.subject_code.ilike(f"%{query.search}%"),
                    Subjects.name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        total = session.exec(
            select(func.count()).select_from(statement.subquery())
        ).one()

        statement = statement.order_by(desc(Subjects.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        subjects = session.exec(statement).all()

        return subjects, total

    @staticmethod
    def get_dropdown(
        *, session: Session, query: BaseQueryParams
    ) -> List[SubjectDropdownResponse]:
        statement = select(Subjects)

        conditions = []
        if query.status:
            conditions.append(Subjects.status == query.status)

        if query.search:
            conditions.append(
                or_(
                    Subjects.subject_code.ilike(f"%{query.search}%"),
                    Subjects.name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        statement = statement.order_by(desc(Subjects.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        subjects = session.exec(statement).all()

        return [
            SubjectDropdownResponse(
                id=subject.id,
                subject_code=subject.subject_code,
                name=subject.name,
            )
            for subject in subjects
        ]

    @staticmethod
    def get_dropdown_by_ids(
        *, session: Session, ids: List[uuid.UUID], request: Request
    ) -> List[SubjectDropdownResponse]:
        if not ids:
            return []

        statement = select(Subjects).where(Subjects.id.in_(ids))
        subjects = session.exec(statement).all()

        return [
            SubjectDropdownResponse(
                id=subject.id,
                subject_code=subject.subject_code,
                name=subject.name,
            )
            for subject in subjects
        ]

    @staticmethod
    def get_by_id(
        *, session: Session, subject_id: uuid.UUID, request: Request
    ) -> SubjectPublic:
        subject = session.get(Subjects, subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject does not exist"
            )
        return SubjectPublic.model_validate(subject)

    @staticmethod
    def create(*, session: Session, subject: SubjectCreate) -> SubjectPublic:
        existing = session.exec(
            select(Subjects).where(Subjects.name == subject.name)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Room {subject.name} already exists.",
            )

        new_subject = Subjects(**subject.dict())
        session.add(new_subject)
        session.commit()
        session.refresh(new_subject)

        return new_subject

    @staticmethod
    def update(
        *, session: Session, subject_id: uuid.UUID, subject_data: SubjectUpdate
    ) -> SubjectPublic:
        subject = session.get(Subjects, subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
            )

        update_data = subject_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(subject, field, value)

        session.commit()

        return SubjectPublic.model_validate(subject)

    @staticmethod
    def delete_many(
        *, session: Session, subject_ids: List[uuid.UUID]
    ) -> List[SubjectDeleteResponse]:
        results: List[SubjectDeleteResponse] = []

        for subject_id in subject_ids:
            subject = session.get(Subjects, subject_id)
            if not subject:
                results.append(
                    SubjectDeleteResponse(id=str(subject_id), message="Subject not found")
                )
                continue

            learning_schedules = session.exec(
                select(LearningSchedules).where(LearningSchedules.subject_id == subject.id)
            ).all()
            if learning_schedules:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Subject has related learning schedules and cannot be deleted.",
                )

            examination_schedules = session.exec(
                select(ExaminationSchedules).where(
                    ExaminationSchedules.subject_id == subject.id
                )
            ).all()
            if examination_schedules:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Subject has related examination schedules and cannot be deleted.",
                )

            if subject.status != StatusEnum.INACTIVE:
                subject.status = StatusEnum.INACTIVE
                message = "Subject set to inactive"
            else:
                message = "Subject already inactive"

            session.commit()
            results.append(SubjectDeleteResponse(id=str(subject_id), message=message))

        return results
