import uuid
from datetime import datetime
from importlib import import_module
from fastapi import HTTPException, Request
from sqlmodel import Session, func, or_, select
from starlette import status
from app.middleware.hashing import hash_password
from typing import List

from app.models.models import (
    Relatives,
    StudentClass,
    Students,
    TuitionFees,
    UserInformations,
)
from app.models.schemas.students.student_schemas import (
    StudentCreateResponse,
    StudentPublic,
    StudentCreateWithUserInfor,
    StudentUpdate,
    StudentDeleteResponse,
    StudentsResponse,
    UserRelativeCreate,
)
from app.models.schemas.user_informations.user_information_schemas import (
    UserInformationPublic,
    UserInformationUpdate,
)
from app.models.schemas.relatives.relative_schemas import RelativePublic
from app.services.user_information import User_Information_Services
from app.services.relatives import RelativeServices
from app.services.classes import ClassServices
from app.enums.status import StatusEnum
from app.enums.class_type import ClassTypeEnum

def _has_relative_payload_value(relative: UserRelativeCreate) -> bool:
    return any(
        bool(value and str(value).strip())
        for value in (
            relative.name,
            relative.phone,
            relative.relationship,
            relative.occupation,
        )
    )


def _sanitize_user_information_payload(payload: dict) -> dict:
    ignored_fields = {"student_id", "teacher_id", "created_at", "updated_at", "id"}
    return {key: value for key, value in payload.items() if key not in ignored_fields}


class StudentServices:
    @staticmethod
    def _get_primary_class_map(
        *, session: Session, student_ids: List[uuid.UUID]
    ) -> dict[uuid.UUID, uuid.UUID]:
        if not student_ids:
            return {}

        student_class_rows = session.exec(
            select(StudentClass)
            .where(StudentClass.student_id.in_(student_ids))
            .order_by(StudentClass.updated_at.desc(), StudentClass.created_at.desc())
        ).all()

        fallback_map: dict[uuid.UUID, uuid.UUID] = {}
        active_map: dict[uuid.UUID, uuid.UUID] = {}

        for row in student_class_rows:
            if row.student_id is None:
                continue

            if row.student_id not in fallback_map:
                fallback_map[row.student_id] = row.class_id

            if (
                row.student_id not in active_map
                and row.status in (None, StatusEnum.ACTIVE)
            ):
                active_map[row.student_id] = row.class_id

        result = fallback_map.copy()
        result.update(active_map)
        return result

    @staticmethod
    def _get_primary_class_id(
        *, session: Session, student_id: uuid.UUID
    ) -> uuid.UUID | None:
        return StudentServices._get_primary_class_map(
            session=session, student_ids=[student_id]
        ).get(student_id)

    @staticmethod
    def _upsert_student_class(
        *,
        session: Session,
        student_id: uuid.UUID,
        class_id: uuid.UUID,
        set_primary_class_type: bool = False,
    ) -> None:
        existing_link = session.exec(
            select(StudentClass).where(
                StudentClass.student_id == student_id,
                StudentClass.class_id == class_id,
            )
        ).first()

        if existing_link:
            existing_link.status = StatusEnum.ACTIVE
            if set_primary_class_type and not existing_link.class_type:
                existing_link.class_type = ClassTypeEnum.PRIMARY
            existing_link.updated_at = datetime.now()
            return

        class_type = ClassTypeEnum.PRIMARY if set_primary_class_type else None
        session.add(
            StudentClass(
                student_id=student_id,
                class_id=class_id,
                status=StatusEnum.ACTIVE,
                class_type=class_type,
            )
        )

    @staticmethod
    def get_all(*, session: Session, query) -> tuple[list[StudentsResponse], int]:
        statement = select(Students)

        conditions = []
        if query.status:
            conditions.append(Students.status == query.status)

        if query.class_id:
            student_ids_by_class = session.exec(
                select(StudentClass.student_id).where(
                    StudentClass.class_id == query.class_id,
                    or_(
                        StudentClass.status == StatusEnum.ACTIVE,
                        StudentClass.status.is_(None),
                    ),
                )
            ).all()
            filtered_student_ids = [
                student_id
                for student_id in student_ids_by_class
                if student_id is not None
            ]
            if not filtered_student_ids:
                return [], 0
            conditions.append(Students.id.in_(filtered_student_ids))

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
                select(UserInformations).where(
                    UserInformations.student_id.in_(student_ids)
                )
            ).all()
            user_infos = {info.student_id: info for info in infos}

        relatives_map = {}
        if student_ids:
            relatives = session.exec(
                select(Relatives).where(Relatives.student_id.in_(student_ids))
            ).all()
            for relative in relatives:
                relatives_map.setdefault(relative.student_id, []).append(relative)

        student_class_map = StudentServices._get_primary_class_map(
            session=session,
            student_ids=student_ids,
        )
        class_ids = [
            class_id for class_id in student_class_map.values() if class_id is not None
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
            class_id = student_class_map.get(student.id)
            class_data = class_map.get(str(class_id), {})

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
                    class_id=class_id,
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
        *, session: Session, student: StudentCreateWithUserInfor
    ) -> StudentCreateResponse:

        if session.exec(
            select(Students).where(Students.student_code == student.student_code)
        ).first():
            raise HTTPException(400, "Student already exists")

        student_data = student.model_dump(
            exclude={"student_information", "student_relatives", "class_id"}
        )
        student_data["password"] = hash_password(student_data["password"])

        new_student = Students(**student_data)
        session.add(new_student)
        session.flush()

        user_info_payload = _sanitize_user_information_payload(
            student.student_information.model_dump(exclude_none=True)
        )
        user_info = UserInformations(**user_info_payload, student_id=new_student.id)

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

        if student.class_id is not None:
            StudentServices._upsert_student_class(
                session=session,
                student_id=new_student.id,
                class_id=student.class_id,
                set_primary_class_type=True,
            )

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
            class_id=student.class_id,
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
                status_code=status.HTTP_404_NOT_FOUND, detail="Student does not exist"
            )
        class_id = StudentServices._get_primary_class_id(
            session=session,
            student_id=student.id,
        )
        payload = student.model_dump()
        payload["class_id"] = class_id
        return StudentPublic.model_validate(payload)

    @staticmethod
    def create_list_student() -> StudentPublic:
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
            exclude={"student_information", "student_relatives", "class_id"},
        )
        for field, value in update_data.items():
            setattr(student, field, value)

        if student_data.class_id is not None:
            StudentServices._upsert_student_class(
                session=session,
                student_id=student.id,
                class_id=student_data.class_id,
            )

        if student_data.student_information:
            info_payload = _sanitize_user_information_payload(
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
                    session.add(UserInformations(**info_payload, student_id=student.id))

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
        class_id = StudentServices._get_primary_class_id(
            session=session,
            student_id=student.id,
        )
        payload = student.model_dump()
        payload["class_id"] = class_id
        return StudentPublic.model_validate(payload)

    @staticmethod
    def delete_many(
        *, session: Session, student_ids: List[uuid.UUID]
    ) -> List[StudentDeleteResponse]:
        results: List[StudentDeleteResponse] = []

        for student_id in student_ids:
            student = session.get(Students, student_id)
            if not student:
                results.append(
                    StudentDeleteResponse(
                        id=str(student_id), message="Student not found"
                    )
                )
                continue

            check_related_entities = select(TuitionFees).where(
                TuitionFees.student_id == student.id
            )
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
