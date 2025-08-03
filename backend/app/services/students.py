import uuid
from datetime import datetime
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List
from app.middleware.hashing import hash_password

from app.models.models import Students
from app.models.models import UserInformations
from app.models.models import TuitionFees
from app.models.schemas.students.student_schemas import (
    StudentPublic,
    StudentCreate,
    StudentCreateWithUserInfor,
    StudentUpdate,
    StudentDeleteResponse,
    StudentWithCitizenID
)
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationCreate
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
        student: StudentCreateWithUserInfor
    ) -> StudentWithCitizenID:
        existing = session.exec(
            select(Students).where(Students.student_code == student.student_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student {student.student_code} already exists.",
            )

        student_data = student.model_dump(exclude={"citizen_id"})

        # hash password
        student_data["password"] = hash_password(student_data["password"])

        new_student = Students(**student_data)
        session.add(new_student)
        session.commit()
        session.refresh(new_student)

        user_info = UserInformations(
            student_id=new_student.id,
            citizen_id=student.citizen_id
        )
        session.add(user_info)
        session.commit()

        user_info = session.exec(
            select(UserInformations).where(UserInformations.student_id == new_student.id)
        ).first()

        return StudentWithCitizenID(
            **new_student.dict(),
            citizen_id=user_info.citizen_id
        )

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

            check_related_entities = select(TuitionFees).where(TuitionFees.student_id == student.id)
            tuition_fees = session.exec(check_related_entities).all()
            if tuition_fees:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Student fees has related Tuition Fees and cannot be deleted.",
                )

            if student.status == StatusEnum.ACTIVE:
                student.status = StatusEnum.INACTIVE
                message = "Student set to inactive"
            else:
                session.delete(student)
                message = "Student deleted successfully"

            session.commit()
            results.append(StudentDeleteResponse(id=str(student_id), message=message))

        return results