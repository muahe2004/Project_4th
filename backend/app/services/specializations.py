import uuid

from fastapi import HTTPException, Request
from sqlmodel import Session, and_, or_, select, func, desc
from starlette import status
from typing import List, Tuple

from app.models.models import Specializations
from app.models.schemas.specializations.specialization_schemas import (
    SpecializationDropdownResponse,
    SpecializationPublic,
    SpecializationCreate,
    SpecializationQueryParams,
    SpecializationUpdate,
    SpecializationDeleteResponse,
)
from app.models.models import Classes

from app.enums.status import StatusEnum


class SpecializationServices:
    @staticmethod
    def get_all(
        *, session: Session, query: SpecializationQueryParams
    ) -> Tuple[List[SpecializationPublic], int]:
        statement = select(Specializations)

        conditions = []
        if query.status:
            conditions.append(Specializations.status == query.status)

        if query.major_id:
            conditions.append(Specializations.major_id == query.major_id)

        if query.search:
            conditions.append(
                or_(
                    Specializations.specialization_code.ilike(f"%{query.search}%"),
                    Specializations.name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        total = session.exec(
            select(func.count()).select_from(statement.subquery())
        ).one()

        statement = statement.order_by(desc(Specializations.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        specializations = session.exec(statement).all()

        return specializations, total

    @staticmethod
    def get_dropdown(
        *, session: Session, query: SpecializationQueryParams
    ) -> List[SpecializationDropdownResponse]:
        statement = select(Specializations)

        conditions = []

        if query.status:
            conditions.append(Specializations.status == query.status)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    Specializations.specialization_code.ilike(search_pattern),
                    Specializations.name.ilike(search_pattern),
                )
            )

        if conditions:
            statement = statement.where(and_(*conditions))

        statement = statement.order_by(desc(Specializations.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        results = session.exec(statement).all()

        return [SpecializationDropdownResponse.model_validate(t) for t in results]

    @staticmethod
    def get_dropdown_by_ids(
        *, session: Session, ids: List[uuid.UUID], request: Request
    ) -> List[SpecializationDropdownResponse]:
        if not ids:
            return []

        statement = select(Specializations).where(Specializations.id.in_(ids))
        results = session.exec(statement).all()

        return [SpecializationDropdownResponse.model_validate(t) for t in results]

    @staticmethod
    def get_by_id(
        *, session: Session, specialization_id: uuid.UUID, request: Request
    ) -> SpecializationPublic:
        specialization = session.get(Specializations, specialization_id)
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specialization does not exist",
            )
        return SpecializationPublic.model_validate(specialization)

    @staticmethod
    def create(
        *,
        session: Session,
        specialization: SpecializationCreate,
    ) -> SpecializationPublic:
        existing = session.exec(
            select(Specializations).where(Specializations.name == specialization.name)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Specialization {specialization.name} already exists.",
            )
        new_specialization = Specializations(**specialization.dict())
        session.add(new_specialization)
        session.commit()
        session.refresh(new_specialization)

        return SpecializationPublic.model_validate(new_specialization)

    @staticmethod
    def update(
        *,
        session: Session,
        specialization_id: uuid.UUID,
        specialization_data: SpecializationUpdate,
    ) -> SpecializationPublic:
        specialization = session.get(Specializations, specialization_id)
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Specialization not found"
            )

        update_data = specialization_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(specialization, field, value)

        session.commit()
        return SpecializationPublic.model_validate(specialization)

    @staticmethod
    def delete(
        *,
        session: Session,
        specialization_id: uuid.UUID,
    ) -> SpecializationDeleteResponse:
        specialization = session.get(Specializations, specialization_id)
        if not specialization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Specialization not found"
            )

        check_related_entities = select(Classes).where(
            Classes.specialization_id == specialization.id
        )
        classes = session.exec(check_related_entities).all()
        if classes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specialization has related classes and cannot be deleted.",
            )

        if specialization.status == StatusEnum.ACTIVE:
            specialization.status = StatusEnum.INACTIVE
            session.commit()
            return SpecializationDeleteResponse(
                id=str(specialization.id), message="Specialization set to inactive"
            )

        session.delete(specialization)
        session.commit()
        return SpecializationDeleteResponse(
            id=str(specialization.id), message="Specialization deleted successfully"
        )
