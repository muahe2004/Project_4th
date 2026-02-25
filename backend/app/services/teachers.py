import uuid
from datetime import datetime

from fastapi import HTTPException, Request
from sqlmodel import Session, and_, desc, or_, select
from starlette import status
from typing import List
from app.middleware.hashing import hash_password

from app.models.models import Teachers
from app.models.models import UserInformations
from app.models.models import Classes
from app.models.schemas.teachers.teacher_schemas import (
    TeacherDropdownResponse,
    TeacherPublic,
    TeacherCreate,
    TeacherResponse,
    TeacherSearchParams,
    TeacherUpdate,
    TeacherDeleteResponse,
    TeacherCreateWithUserInfor,
    TeacherWithCitizenID
)

from app.enums.status import StatusEnum

def get_all_teachers() -> List[dict]:
    """Utility for services that need a lightweight teacher list (id, name)."""
    # Local import to avoid circular deps with SessionDep
    from app.core.database import engine

    with Session(engine) as session:
        teachers = session.exec(select(Teachers)).all()
        return [{"id": t.id, "name": t.name} for t in teachers]


class TeacherServices:
    @staticmethod
    def get_all(*, session: Session) -> List[TeacherPublic]:
        teachers = session.exec(select(Teachers)).all()
        return teachers
    
    @staticmethod
    def get_list_teacher(*, session: Session, teacher_ids: List[str]) -> List[TeacherResponse]:
        if not teacher_ids:
            return []

        statement = select(Teachers).where(Teachers.id.in_(teacher_ids))
        results = session.exec(statement).all()
        return results
    
    @staticmethod
    def get_dropdown(*, session: Session, query: TeacherSearchParams) -> List[TeacherDropdownResponse]:
        statement = select(Teachers)

        conditions = []

        if query.status:
            conditions.append(Teachers.status == query.status)

        if query.department_id:
            conditions.append(Teachers.department_id == query.department_id)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    Teachers.teacher_code.ilike(search_pattern),
                    Teachers.name.ilike(search_pattern),
                )
            )

        if conditions:
            statement = statement.where(and_(*conditions))

        statement = statement.order_by(desc(Teachers.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        results = session.exec(statement).all()

        return [TeacherDropdownResponse.model_validate(t) for t in results]
    
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
        teacher: TeacherCreateWithUserInfor,
    ) -> TeacherWithCitizenID:
        existing = session.exec(
            select(Teachers).where(Teachers.teacher_code == teacher.teacher_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Teacher {teacher.teacher_code} already exists.",
            )
        
        teacher_data = teacher.model_dump(exclude={"citizen_id"})

        teacher_data["password"] = hash_password(teacher_data["password"])

        new_teacher = Teachers(**teacher_data)
        session.add(new_teacher)
        session.commit()
        session.refresh(new_teacher)

        user_info = UserInformations(
            teacher_id=new_teacher.id,
            citizen_id=teacher.citizen_id
        )
        session.add(user_info)
        session.commit()

        user_info = session.exec(
            select(UserInformations).where(UserInformations.teacher_id == new_teacher.id)
        ).first()

        return TeacherWithCitizenID(
            **new_teacher.dict(),
            citizen_id=user_info.citizen_id
        )

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
        results: List[TeacherDeleteResponse] = []

        for teacher_id in teacher_ids:
            teacher = session.get(Teachers, teacher_id)
            if not teacher:
                results.append(
                    TeacherDeleteResponse(id=str(teacher_id), message="Teacher not found")
                )
                continue

            check_related_entities = select(Classes).where(Classes.teacher_id == teacher.id)
            classes = session.exec(check_related_entities).all()
            if classes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Teacher has related classes and cannot be deleted.",
                )

            if teacher.status == StatusEnum.ACTIVE:
                teacher.status = StatusEnum.INACTIVE
                message = "Teacher set to inactive"
            else:
                session.delete(teacher)
                message = "Teacher deleted successfully"

            session.commit()
            results.append(TeacherDeleteResponse(id=str(teacher_id), message=message))

        return results
