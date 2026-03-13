import uuid

from fastapi import HTTPException, Request
from sqlmodel import Session, or_, select, func, desc
from starlette import status
from typing import List, Tuple

from app.models.models import Majors
from app.models.schemas.majors.major_schemas import (
    MajorPublic,
    MajorCreate,
    MajorQueryParams,
    MajorUpdate,
    MajorDeleteResponse,
)
from app.models.models import Specializations

from app.enums.status import StatusEnum


class MajorServices:
    @staticmethod
    def get_all(
        *, session: Session, query: MajorQueryParams
    ) -> Tuple[List[MajorPublic], int]:
        statement = select(Majors)

        conditions = []
        if query.status:
            conditions.append(Majors.status == query.status)

        if query.department_id:
            conditions.append(Majors.department_id == query.department_id)

        if query.search:
            conditions.append(
                or_(
                    Majors.major_code.ilike(f"%{query.search}%"),
                    Majors.name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        total = session.exec(
            select(func.count()).select_from(statement.subquery())
        ).one()

        statement = statement.order_by(desc(Majors.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        majors = session.exec(statement).all()

        return majors, total

    @staticmethod
    def get_by_id(
        *, session: Session, major_id: uuid.UUID, request: Request
    ) -> MajorPublic:
        major = session.get(Majors, major_id)
        if not major:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Major does not exist"
            )
        return MajorPublic.model_validate(major)

    @staticmethod
    def create(
        *,
        session: Session,
        major: MajorCreate,
    ) -> MajorPublic:
        existing = session.exec(select(Majors).where(Majors.name == major.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Major {major.name} already exists.",
            )
        new_major = Majors(**major.dict())
        session.add(new_major)
        session.commit()
        session.refresh(new_major)

        return MajorPublic.model_validate(new_major)

    @staticmethod
    def update(
        *,
        session: Session,
        major_id: uuid.UUID,
        major_data: MajorUpdate,
    ) -> MajorPublic:
        major = session.get(Majors, major_id)
        if not major:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Major not found"
            )

        update_data = major_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(major, field, value)

        session.commit()
        return MajorPublic.model_validate(major)

    @staticmethod
    def delete(
        *,
        session: Session,
        major_id: uuid.UUID,
    ) -> MajorDeleteResponse:
        major = session.get(Majors, major_id)
        if not major:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Major not found"
            )

        check_related_entities = select(Specializations).where(
            Specializations.major_id == major.id
        )
        specializations = session.exec(check_related_entities).all()
        if specializations:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Major has related specializations and cannot be deleted.",
            )

        if major.status == StatusEnum.ACTIVE:
            major.status = StatusEnum.INACTIVE
            session.commit()
            return MajorDeleteResponse(
                id=str(major.id), message="Major set to inactive"
            )

        session.delete(major)
        session.commit()
        return MajorDeleteResponse(
            id=str(major.id), message="Major deleted successfully"
        )
