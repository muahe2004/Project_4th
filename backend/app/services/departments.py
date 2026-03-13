import uuid

from fastapi import HTTPException, Request
from sqlmodel import Session, desc, or_, select, func
from starlette import status
from typing import List, Tuple

from app.models.models import Departments
from app.models.schemas.departments.department_schemas import (
    DepartmentDropDownResponse,
    DepartmentPublic,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentDeleteResponse,
)
from app.models.models import Majors

from app.enums.status import StatusEnum
from app.models.schemas.common.query import BaseQueryParams


class DepartmentServices:
    @staticmethod
    def get_all(
        *, session: Session, query: BaseQueryParams
    ) -> Tuple[List[DepartmentPublic], int]:
        statement = select(Departments)

        conditions = []
        if query.status:
            conditions.append(Departments.status == query.status)

        if query.search:
            conditions.append(
                or_(
                    Departments.department_code.ilike(f"%{query.search}%"),
                    Departments.name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        total = session.exec(
            select(func.count()).select_from(statement.subquery())
        ).one()

        statement = statement.order_by(desc(Departments.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        departments = session.exec(statement).all()

        return departments, total

    @staticmethod
    def get_by_id(
        *, session: Session, department_id: uuid.UUID, request: Request
    ) -> DepartmentPublic:
        department = session.get(Departments, department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department does not exist",
            )
        return DepartmentPublic.model_validate(department)

    @staticmethod
    def create(
        *,
        session: Session,
        department: DepartmentCreate,
    ) -> DepartmentPublic:
        existing = session.exec(
            select(Departments).where(Departments.name == department.name)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department {department.name} already exists.",
            )
        new_department = Departments(**department.dict())
        session.add(new_department)
        session.commit()
        session.refresh(new_department)

        return new_department

    @staticmethod
    def update(
        *,
        session: Session,
        department_id: uuid.UUID,
        department_data: DepartmentUpdate,
    ) -> DepartmentPublic:
        department = session.get(Departments, department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )

        update_data = department_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(department, field, value)

        session.commit()
        return DepartmentPublic.model_validate(department)

    @staticmethod
    def delete(
        *,
        session: Session,
        department_id: uuid.UUID,
    ) -> DepartmentDeleteResponse:
        department = session.get(Departments, department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )

        check_related_entities = select(Majors).where(
            Majors.department_id == department.id
        )
        majors = session.exec(check_related_entities).all()
        if majors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department has related majors and cannot be deleted.",
            )

        if department.status == StatusEnum.ACTIVE:
            department.status = StatusEnum.INACTIVE
            session.commit()
            return DepartmentDeleteResponse(
                id=str(department.id), message="Department set to inactive"
            )

        session.delete(department)
        session.commit()
        return DepartmentDeleteResponse(
            id=str(department.id), message="Department deleted successfully"
        )

    @staticmethod
    def get_dropdown_by_ids(
        *, session: Session, ids: List[uuid.UUID], request: Request
    ) -> List[DepartmentDropDownResponse]:
        if not ids:
            return []

        statement = select(Departments).where(Departments.id.in_(ids))
        departments = session.exec(statement).all()

        return [DepartmentDropDownResponse.model_validate(c) for c in departments]
