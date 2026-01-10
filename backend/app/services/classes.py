import uuid
from datetime import datetime
import json
from fastapi import HTTPException, Request
from sqlalchemy import or_
from sqlmodel import Session, select, func
from starlette import status
from typing import List, Optional, Tuple

from app.models.models import Classes
from app.models.models import Specializations
from app.models.schemas.classes.class_schemas import (
    ClassDropDownResponse,
    ClassPublic,
    ClassCreate,
    ClassQueryParams,
    ClassUpdate,
    ClassDeleteResponse,
    ClassesResponse
)
from app.models.models import Students

from app.enums.status import StatusEnum
from app.services.teachers import get_all_teachers

class ClassServices:
    @staticmethod
    def get_all(
        *,
        session: Session,
        query: ClassQueryParams
    ) -> Tuple[List[ClassesResponse], int]:
        statement = (
            select(
                Classes.id,
                Classes.class_code,
                Classes.class_name,
                Classes.size,
                Classes.status,
                Classes.created_at,
                Classes.updated_at,
                Classes.specialization_id,
                Classes.teacher_id,
                Specializations.name.label("specialization_name"),
            )
            .join(Specializations, Specializations.id == Classes.specialization_id)
        )

        teacher_info = get_all_teachers()
        teacher_map = {str(t["id"]): t["name"] for t in teacher_info}

        conditions = []
        if query.status:
            conditions.append(Classes.status == query.status)

        if query.specialization_id:
            conditions.append(Classes.specialization_id == query.specialization_id)

        if query.teacher_id:
            conditions.append(Classes.teacher_id == query.teacher_id)

        if query.search:
            conditions.append(
                or_(
                    Classes.class_code.ilike(f"%{query.search}%"),
                    Classes.class_name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        count_stmt = select(func.count()).select_from(Classes)
        if conditions:
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(Classes.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()

        classes = []
        for r in results:
            data = r._asdict()
            t_id = str(data.get("teacher_id"))
            data["teacher_name"] = teacher_map.get(t_id, "Chưa xác định")
            classes.append(ClassesResponse(**data))

        return classes, total

    @staticmethod
    def get_by_id(
        *, session: Session, class_id: uuid.UUID, request: Request
    ) -> ClassPublic:
        class_ = session.get(Classes, class_id)
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class does not exist"
            )
        return ClassPublic.model_validate(class_)
    
    @staticmethod
    def get_dropdown_by_ids(
        *, session: Session, ids: List[uuid.UUID], request: Request
    ) -> List[ClassDropDownResponse]:
        if not ids:
            return []

        statement = select(Classes).where(Classes.id.in_(ids))
        classes = session.exec(statement).all()

        return [ClassDropDownResponse.model_validate(c) for c in classes]


    @staticmethod
    def create(
        *,
        session: Session,
        class_: ClassCreate,
    ) -> ClassPublic:
        existing = session.exec(
            select(Classes).where(Classes.class_code == class_.class_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Class {class_.class_code} already exists.",
            )
        new_class = Classes(**class_.dict())
        session.add(new_class)
        session.commit()
        session.refresh(new_class)

        return ClassPublic.model_validate(new_class)

    @staticmethod
    def update(
        *,
        session: Session,
        class_id: uuid.UUID,
        class_data: ClassUpdate,
    ) -> ClassPublic:
        class_ = session.get(Classes, class_id)
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found"
            )

        update_data = class_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(class_, field, value)

        session.commit()
        return ClassPublic.model_validate(class_)

    @staticmethod
    def delete_many(
        *,
        session: Session,
        class_ids: List[uuid.UUID]
    ) -> List[ClassDeleteResponse]:
        results = []

        for class_id in class_ids:
            class_ = session.get(Classes, class_id)
            if not class_:
                results.append(
                    ClassDeleteResponse(id=str(class_id), message="Class not found")
                )
                continue

            students = session.exec(
                select(Students).where(Students.class_id == class_id)
            ).all()
            if students:
                results.append(
                    ClassDeleteResponse(
                        id=str(class_id),
                        message="Class has students and cannot be deleted."
                    )
                )
                continue

            if class_.status == StatusEnum.ACTIVE:
                class_.status = StatusEnum.INACTIVE
                message = "Class set to inactive"
            else:
                session.delete(class_)
                message = "Class deleted successfully"

            session.commit()
            results.append(ClassDeleteResponse(id=str(class_id), message=message))

        return results