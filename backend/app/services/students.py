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
    StudentsResponse
)
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationPublic
)
from app.models.schemas.relatives.relative_schemas import RelativePublic

from app.services.classes import ClassServices
from app.enums.status import StatusEnum

class StudentServices:
    @staticmethod
    def get_all(*, session: Session, query) -> tuple[list[StudentsResponse], int]:
        statement = (
            select(Students, UserInformations, Relatives)
            .outerjoin(
                UserInformations,
                UserInformations.student_id == Students.id,
            )
            .outerjoin(
                Relatives,
                Relatives.student_id == Students.id,
            )
        )

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

        rows = session.exec(statement).all()

        student_rows: dict[
            uuid.UUID,
            dict[str, object],
        ] = {}
        for student, user_info, relative in rows:
            if student.id not in student_rows:
                student_rows[student.id] = {
                    "student": student,
                    "user_info": user_info,
                    "relatives": [],
                }

            if relative:
                student_rows[student.id]["relatives"].append(
                    RelativePublic.model_validate(relative)
                )

        # collect class_ids
        class_ids = [
            entry["student"].class_id
            for entry in student_rows.values()
            if entry["student"].class_id is not None
        ]

        # call class service
        class_info = ClassServices.get_dropdown_by_ids(
            session=session,
            ids=class_ids,
            request=None,
        )
        class_map = {
            str(c["id"]): {
                "class_code": c["class_code"],
                "class_name": c["class_name"],
            }
            for c in class_info
        }

        students: list[StudentsResponse] = []
        for entry in student_rows.values():
            student = entry["student"]
            user_info = entry["user_info"]
            student_relatives = entry["relatives"]
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

        if session.exec(
            select(UserInformations).where(
                UserInformations.citizen_id ==
                student.student_information.citizen_id
            )
        ).first():
            raise HTTPException(400, "Citizen ID already exists")

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

            if student.status == StatusEnum.ACTIVE:
                student.status = StatusEnum.INACTIVE
                message = "Student set to inactive"
            else:
                session.delete(student)
                message = "Student deleted successfully"

            session.commit()
            results.append(StudentDeleteResponse(id=str(student_id), message=message))

        return results
