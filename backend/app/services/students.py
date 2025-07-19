import uuid
from datetime import datetime
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import Students
from app.models.schemas.students.student_schemas import (
    StudentPublic,
    StudentCreate,
    StudentUpdate,
    StudentDeleteResponse
)

from app.enums.status import StatusEnum

class StudentServices:
    @staticmethod
    def get_all(*, session: Session) -> List[StudentPublic]:
        students = session.exec(select(Students)).all()
        return students

    @staticmethod
    def create(
        *,
        session: Session,
        student: StudentCreate,
    ) -> StudentPublic:
        existing = session.exec(
            select(Students).where(Students.student_code == student.student_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student {student.student_code} already exists.",
            )
        new_student = Students(**student.dict())
        session.add(new_student)
        session.commit()
        session.refresh(new_student)

        return StudentPublic.model_validate(new_student)
    
    @staticmethod
    def get_by_id(
        *, session: Session, student_id: uuid.UUID, request: Request
    ) -> StudentPublic:
        student = session.get(Students, student_id)
        if not student:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND, detail="Student does not exist"
            )
        return StudentPublic.model_validate(student)
    
    @staticmethod
    def create_list_student(

    ) -> StudentPublic:
        return "Create list student"
    
    @staticmethod
    def update(
        *,
        session: Session,
        student_id: uuid.UUID,
        student_data: StudentUpdate,
    ) -> StudentPublic:
        student = session.get(Students, student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
            )

        update_data = student_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(student, field, value)

        session.commit()
        return StudentPublic.model_validate(student)
    
    @staticmethod
    def delete_many(
        *,
        session: Session,
        student_ids: List[uuid.UUID]
    ) -> List[StudentDeleteResponse]:
        results = []

        for student_id in student_ids:
            student = session.get(Students, student_id)
            if not student:
                results.append(
                    StudentDeleteResponse(id=str(student_id), message="Student not found")
                )
                continue

            # check relationship

            if student.status == StatusEnum.ACTIVE:
                student.status = StatusEnum.INACTIVE
                message = "Student set to inactive"
            else:
                session.delete(student)
                message = "Student deleted successfully"

            session.commit()
            results.append(StudentDeleteResponse(id=str(student_id), message=message))

        return results


student_services = StudentServices()