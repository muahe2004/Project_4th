import uuid
from datetime import datetime
from fastapi import HTTPException, Request
from sqlmodel import Session, select
from starlette import status
from typing import List

from app.models.models import UserInformations
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationPublic,
    UserInformationCreate,
    UserInformationUpdate,
    UserInformationDeleteResponse,
)

class User_Information_Services:
    @staticmethod
    def get_all(*, session: Session) -> List[UserInformationPublic]:
        userinformations = session.exec(select(UserInformations)).all()
        return userinformations

    # @staticmethod
    # def create(
    #     *,
    #     session: Session,
    #     student: StudentCreateWithUserInfor
    # ) -> StudentWithCitizenID:
    #     existing = session.exec(
    #         select(Students).where(Students.student_code == student.student_code)
    #     ).first()
    #     if existing:
    #         raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST,
    #             detail=f"Student {student.student_code} already exists.",
    #         )

    #     student_data = student.model_dump(exclude={"citizen_id"})
    #     new_student = Students(**student_data)
    #     session.add(new_student)
    #     session.commit()
    #     session.refresh(new_student)

    #     user_info = UserInformations(
    #         student_id=new_student.id,
    #         citizen_id=student.citizen_id
    #     )
    #     session.add(user_info)
    #     session.commit()

    #     user_info = session.exec(
    #         select(UserInformations).where(UserInformations.student_id == new_student.id)
    #     ).first()

    #     return StudentWithCitizenID(
    #         **new_student.dict(),
    #         citizen_id=user_info.citizen_id
    #     )

    # @staticmethod
    # def get_by_id(
    #     *, session: Session, student_id: uuid.UUID, request: Request
    # ) -> StudentPublic:
    #     student = session.get(Students, student_id)
    #     if not student:
    #         raise HTTPException(
    #             status_code = status.HTTP_404_NOT_FOUND, detail="Student does not exist"
    #         )
    #     return StudentPublic.model_validate(student)
    
    # @staticmethod
    # def create_list_student(

    # ) -> StudentPublic:
    #     return "Create list student"
    
    # @staticmethod
    # def update(
    #     *,
    #     session: Session,
    #     student_id: uuid.UUID,
    #     student_data: StudentUpdate,
    # ) -> StudentPublic:
    #     student = session.get(Students, student_id)
    #     if not student:
    #         raise HTTPException(
    #             status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
    #         )

    #     update_data = student_data.model_dump(exclude_unset=True)
    #     for field, value in update_data.items():
    #         setattr(student, field, value)

    #     session.commit()
    #     return StudentPublic.model_validate(student)

    @staticmethod
    def update(
        *,
        session: Session,
        user_information_id: uuid.UUID,
        user_information_data: UserInformationUpdate,
    ) -> UserInformationPublic: 
        user_information = session.get(UserInformations, user_information_id)
        if not user_information:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User information not found"
            )
        
        update_data = user_information_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user_information, field, value)

        session.commit()
        return UserInformationPublic.model_validate(user_information)
    
    # @staticmethod
    # def delete_many(
    #     *,
    #     session: Session,
    #     student_ids: List[uuid.UUID]
    # ) -> List[StudentDeleteResponse]:
    #     results = []

    #     for student_id in student_ids:
    #         student = session.get(Students, student_id)
    #         if not student:
    #             results.append(
    #                 StudentDeleteResponse(id=str(student_id), message="Student not found")
    #             )
    #             continue

    #         # check relationship

    #         if student.status == StatusEnum.ACTIVE:
    #             student.status = StatusEnum.INACTIVE
    #             message = "Student set to inactive"
    #         else:
    #             session.delete(student)
    #             message = "Student deleted successfully"

    #         session.commit()
    #         results.append(StudentDeleteResponse(id=str(student_id), message=message))

    #     return results


userinformation_services = User_Information_Services()