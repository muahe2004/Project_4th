import uuid
from datetime import datetime

from fastapi import HTTPException, Request
from sqlmodel import Session, desc, select, func
from starlette import status
from typing import List, Optional, Tuple

from app.models.models import Departments
from app.models.schemas.departments.department_schemas import (
    DepartmentPublic,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentDeleteResponse
)
from app.models.models import Majors

from app.enums.status import StatusEnum

class DepartmentServices:
    @staticmethod
    def get_all(
        *, session: Session,
        skip: int = 0,
        limit: int = 10,
        status: Optional[str] = None
    ) -> Tuple[List[DepartmentPublic], int]:
        statement = select(Departments)

        if status:
            statement = statement.where(Departments.status == status)

        total = session.exec(
            select(func.count()).select_from(statement.subquery())
        ).one()

        statement = statement.order_by(desc(Departments.created_at))
        statement = statement.offset(skip).limit(limit)
        departments = session.exec(statement).all()

        return departments, total

    @staticmethod
    def get_by_id(
        *, session: Session, department_id: uuid.UUID, request: Request
    ) -> DepartmentPublic:
        department = session.get(Departments, department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department does not exist"
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

        check_related_entities = select(Majors).where(Majors.department_id == department.id)
        majors = session.exec(check_related_entities).all()
        if majors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department has related majors and cannot be deleted.",
            )

        if department.status == StatusEnum.ACTIVE:
            department.status = StatusEnum.INACTIVE
            session.commit()
            return DepartmentDeleteResponse(id=str(department.id), message="Department set to inactive")

        session.delete(department)
        session.commit()
        return DepartmentDeleteResponse(id=str(department.id), message="Department deleted successfully")