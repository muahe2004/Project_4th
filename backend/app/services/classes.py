import uuid
from datetime import datetime

from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Classes
from app.models.schemas.classes.class_schemas import (
    ClassPublic,
    ClassCreate,
    ClassUpdate,
    ClassDeleteResponse
)
from app.models.models import Students

from app.enums.status import StatusEnum

class ClassServices:
    @staticmethod
    def get_all(*, session: Session) -> List[ClassPublic]:
        classes = session.exec(select(Classes)).all()
        return classes

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


class_service = ClassServices()
