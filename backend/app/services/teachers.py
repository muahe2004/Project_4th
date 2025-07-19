import uuid
from datetime import datetime

from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Teachers
from app.models.schemas.teachers.teacher_schemas import (
    TeacherPublic,
    TeacherCreate,
    TeacherUpdate,
    TeacherDeleteResponse
)
from app.models.models import Classes

from app.enums.status import StatusEnum

class TeacherServices:
    @staticmethod
    def get_all(*, session: Session) -> List[TeacherPublic]:
        teachers = session.exec(select(Teachers)).all()
        return teachers

    @staticmethod
    def get_by_id(
        *, session: Session, teacher_id: uuid.UUID, request: Request
    ) -> TeacherPublic:
        teacher = session.get(Teachers, teacher_id)
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Teacher does not exist"
            )
        return TeacherPublic.model_validate(teacher)

    @staticmethod
    def create(
        *,
        session: Session,
        teacher: TeacherCreate,
    ) -> TeacherPublic:
        existing = session.exec(
            select(Teachers).where(Teachers.teacher_code == teacher.teacher_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Teacher {teacher.teacher_code} already exists.",
            )
        new_teacher = Teachers(**teacher.dict())
        session.add(new_teacher)
        session.commit()
        session.refresh(new_teacher)

        return TeacherPublic.model_validate(new_teacher)

    @staticmethod
    def update(
        *,
        session: Session,
        teacher_id: uuid.UUID,
        teacher_data: TeacherUpdate,
    ) -> TeacherPublic:
        teacher = session.get(Teachers, teacher_id)
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found"
            )

        update_data = teacher_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(teacher, field, value)

        session.commit()
        return TeacherPublic.model_validate(teacher)

    @staticmethod
    def delete_many(
        *,
        session: Session,
        teacher_ids: List[uuid.UUID]
    ) -> List[TeacherDeleteResponse]:
        results = []

        for teacher_id in teacher_ids:
            teacher = session.get(Teachers, teacher_id)
            if not teacher:
                results.append(
                    TeacherDeleteResponse(id=str(teacher_id), message="Teacher not found")
                )
                continue

            classes = session.exec(
                select(Classes).where(Classes.teacher_id == teacher_id)
            ).all()
            if classes:
                results.append(
                    TeacherDeleteResponse(
                        id=str(teacher_id),
                        message="Teacher has classes and cannot be deleted."
                    )
                )
                continue

            if teacher.status == StatusEnum.ACTIVE:
                teacher.status = StatusEnum.INACTIVE
                message = "Teacher set to inactive"
            else:
                session.delete(teacher)
                message = "Teacher deleted successfully"

            session.commit()
            results.append(TeacherDeleteResponse(id=str(teacher_id), message=message))

        return results
    
teacher_service = TeacherServices()
