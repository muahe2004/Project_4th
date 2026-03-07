import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, func, or_, select
from starlette import status
from app.middleware.hashing import hash_password
from typing import List

from app.models.models import Relatives, Students, UserInformations, TuitionFees
from app.models.schemas.students.student_schemas import (
    StudentCreateResponse,
    StudentPublic,
    StudentCreate,
    StudentCreateWithUserInfor,
    StudentQueryParams,
    StudentUpdate,
    StudentDeleteResponse,
    StudentWithCitizenID,
    StudentsResponse,
    StudentRelativeCreate,
)
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationPublic,
    UserInformationUpdate,
)
from app.models.schemas.relatives.relative_schemas import RelativePublic
from app.services.user_information import User_Information_Services
from app.services.relatives import RelativeServices
from app.services.classes import ClassServices

def _has_relative_payload_value(relative: StudentRelativeCreate) -> bool:
    return any(
        bool(value and str(value).strip())
        for value in (
            relative.name,
            relative.phone,
            relative.relationship,
            relative.occupation,
        )
    )
from app.enums.status import StatusEnum

class StudentServices:
    @staticmethod
    def get_all(*, session: Session, query) -> tuple[list[StudentsResponse], int]:
        statement = select(Students)

        conditions = []
        if query.status:
            conditions.append(Students.status == query.status)

        if query.class_id:
            conditions.append(Students.class_id == query.class_id)

        if query.search:
            conditions.append(
                or_(
                    Students.student_code.ilike(f"%{query.search}%"),
                    Students.name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        count_stmt = select(func.count()).select_from(Students)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(Students.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        students_page = session.exec(statement).all()
        student_ids = [student.id for student in students_page]

        user_infos = {}
        if student_ids:
            infos = session.exec(
                select(UserInformations).where(UserInformations.student_id.in_(student_ids))
            ).all()
            user_infos = {info.student_id: info for info in infos}

        relatives_map = {}
        if student_ids:
            relatives = session.exec(
                select(Relatives).where(Relatives.student_id.in_(student_ids))
            ).all()
            for relative in relatives:
                relatives_map.setdefault(relative.student_id, []).append(relative)

        class_ids = [
            student.class_id
            for student in students_page
            if student.class_id is not None
        ]

        class_info = ClassServices.get_dropdown_by_ids(
            session=session,
            ids=class_ids,
            request=None,
        )
        class_map = {
            str(c.id): {
                "class_code": c.class_code,
                "class_name": c.class_name,
            }
            for c in class_info
        }

        students: list[StudentsResponse] = []
        for student in students_page:
            user_info = user_infos.get(student.id)
            student_relatives = relatives_map.get(student.id, [])
            class_data = class_map.get(str(student.class_id), {})

            students.append(
                StudentsResponse(
                    id=student.id,
                    student_code=student.student_code,
                    name=student.name,
                    date_of_birth=student.date_of_birth,
                    gender=student.gender,
                    email=student.email,
                    phone=student.phone,
                    address=student.address,
                    class_id=student.class_id,
                    training_program=student.training_program,
                    course=student.course,
                    status=student.status,
                    created_at=student.created_at,
                    updated_at=student.updated_at,
                    class_code=class_data.get("class_code"),
                    class_name=class_data.get("class_name"),
                    student_information=(
                        UserInformationPublic.model_validate(user_info)
                        if user_info is not None
                        else None
                    ),
                    student_relative=student_relatives,
                )
            )

        return students, total

    @staticmethod
    def create(
        *,
        session: Session,
        student: StudentCreateWithUserInfor
    ) -> StudentCreateResponse:

        if session.exec(
            select(Students).where(Students.student_code == student.student_code)
        ).first():
            raise HTTPException(400, "Student already exists")

        student_data = student.model_dump(exclude={"student_information"})
        student_data["password"] = hash_password(student_data["password"])

        new_student = Students(**student_data)
        session.add(new_student)
        session.flush()

        user_info = UserInformations(
            **student.student_information.model_dump(),
            student_id=new_student.id,
        )

        session.add(user_info)

        relatives = []
        for relative in student.student_relatives:
            relative_data = relative.model_dump(exclude_none=True)
            if not relative_data:
                continue
            relative_record = Relatives(
                **relative_data,
                student_id=new_student.id,
            )
            session.add(relative_record)
            relatives.append(relative_record)

        session.commit()
        session.refresh(new_student)
        session.refresh(user_info)

        student_relatives_response = (
            [RelativePublic.model_validate(rel) for rel in relatives]
            if relatives
            else None
        )
        return StudentCreateResponse(
            **new_student.dict(),
            student_information=UserInformationPublic.model_validate(user_info),
            student_relative=student_relatives_response,
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

        update_data = student_data.model_dump(
            exclude_unset=True,
            exclude={"student_information", "student_relatives"},
        )
        for field, value in update_data.items():
            setattr(student, field, value)

        if student_data.student_information:
            info_payload = (
                student_data.student_information.model_dump(exclude_none=True)
            )
            if info_payload:
                user_info = session.exec(
                    select(UserInformations).where(
                        UserInformations.student_id == student.id
                    )
                ).one_or_none()
                user_info_update = UserInformationUpdate(**info_payload)
                if user_info:
                    User_Information_Services.update(
                        session=session,
                        user_information_id=user_info.id,
                        user_information_data=user_info_update,
                        commit=False,
                    )
                else:
                    session.add(
                        UserInformations(**info_payload, student_id=student.id)
                    )

        if student_data.student_relatives is not None:
            filtered_relatives = [
                rel
                for rel in student_data.student_relatives
                if _has_relative_payload_value(rel)
            ]
            RelativeServices.replace_for_student(
                session=session,
                student_id=student.id,
                relatives=filtered_relatives,
                commit=False,
            )

        session.commit()
        return StudentPublic.model_validate(student)
    
    @staticmethod
    def delete_many(
        *,
        session: Session,
        student_ids: List[uuid.UUID]
    ) -> List[StudentDeleteResponse]:
        results: List[StudentDeleteResponse] = []

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
                    detail="Student has related tuition fees and cannot be deleted.",
                )

            if student.status != StatusEnum.INACTIVE:
                student.status = StatusEnum.INACTIVE
                message = "Student set to inactive"
            else:
                message = "Student already inactive"

            session.commit()
            results.append(StudentDeleteResponse(id=str(student_id), message=message))

        return results