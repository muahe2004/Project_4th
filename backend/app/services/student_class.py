import uuid
from app.models.schemas.classes.student_class_schemas import (
    StudentClassCreate,
    StudentClassPublic,
    StudentClassUpdate,
)
from fastapi import HTTPException
from sqlmodel import Session, select
from starlette import status

from app.models.models import StudentClass

# from app.services.teachers import get_all_teachers


class StudentClassServices:
    # @staticmethod
    # def get_all(
    #     *,
    #     session: Session,
    #     query: StudentClassQueryParams
    # ) -> Tuple[List[ClassesResponse], int]:
    #     statement = (
    #         select(
    #             StudentClass.id,
    #             StudentClass.class_id,
    #             StudentClass.student_id,
    #             StudentClass.status,
    #             StudentClass.created_at,
    #             StudentClass.updated_at,
    #         )
    #         .join(Specializations, Specializations.id == StudentClass.specialization_id)
    #     )

    #     teacher_info = get_all_teachers()
    #     teacher_map = {str(t["id"]): t["name"] for t in teacher_info}

    #     conditions = []
    #     if query.status:
    #         conditions.append(StudentClass.status == query.status)

    #     if query.specialization_id:
    #         conditions.append(StudentClass.specialization_id == query.specialization_id)

    #     if query.teacher_id:
    #         conditions.append(StudentClass.teacher_id == query.teacher_id)

    #     if query.search:
    #         conditions.append(
    #             or_(
    #                 StudentClass.class_code.ilike(f"%{query.search}%"),
    #                 StudentClass.class_name.ilike(f"%{query.search}%"),
    #             )
    #         )

    #     if conditions:
    #         statement = statement.where(*conditions)

    #     count_stmt = select(func.count()).select_from(Classes)
    #     if conditions:
    #         count_stmt = count_stmt.where(*conditions)

    #     total = session.exec(count_stmt).one()

    #     statement = (
    #         statement.order_by(Classes.created_at.desc())
    #         .offset(query.skip)
    #         .limit(query.limit)
    #     )

    #     results = session.exec(statement).all()

    #     classes = []
    #     for r in results:
    #         data = r._asdict()
    #         t_id = str(data.get("teacher_id"))
    #         data["teacher_name"] = teacher_map.get(t_id, "Chưa xác định")
    #         classes.append(ClassesResponse(**data))

    #     return classes, total

    # @staticmethod
    # def get_by_id(
    #     *, session: Session, class_id: uuid.UUID, request: Request
    # ) -> ClassPublic:
    #     class_ = session.get(Classes, class_id)
    #     if not class_:
    #         raise HTTPException(
    #             status_code=status.HTTP_404_NOT_FOUND, detail="Class does not exist"
    #         )
    #     return ClassPublic.model_validate(class_)

    @staticmethod
    def create(
        *,
        session: Session,
        class_: StudentClassCreate,
    ) -> StudentClassPublic:
        existing = session.exec(
            select(StudentClass).where(
                (StudentClass.class_id == class_.class_id)
                & (StudentClass.student_id == class_.student_id)
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Class already exists.",
            )
        new_class = StudentClass(**class_.model_dump())
        session.add(new_class)
        session.commit()
        session.refresh(new_class)

        return StudentClassPublic.model_validate(new_class)

    @staticmethod
    def update(
        *,
        session: Session,
        student_class_id: uuid.UUID,
        student_class_data: StudentClassUpdate,
    ) -> StudentClassPublic:
        class_ = session.get(StudentClass, student_class_id)
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
            )

        update_data = student_class_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(class_, field, value)

        session.commit()
        return StudentClassPublic.model_validate(class_)

    # @staticmethod
    # def delete_many(
    #     *,
    #     session: Session,
    #     class_ids: List[uuid.UUID]
    # ) -> List[ClassDeleteResponse]:
    #     results = []

    #     for class_id in class_ids:
    #         class_ = session.get(Classes, class_id)
    #         if not class_:
    #             results.append(
    #                 ClassDeleteResponse(id=str(class_id), message="Class not found")
    #             )
    #             continue

    #         students = session.exec(
    #             select(Students).where(Students.class_id == class_id)
    #         ).all()
    #         if students:
    #             results.append(
    #                 ClassDeleteResponse(
    #                     id=str(class_id),
    #                     message="Class has students and cannot be deleted."
    #                 )
    #             )
    #             continue

    #         if class_.status == StatusEnum.ACTIVE:
    #             class_.status = StatusEnum.INACTIVE
    #             message = "Class set to inactive"
    #         else:
    #             session.delete(class_)
    #             message = "Class deleted successfully"

    #         session.commit()
    #         results.append(ClassDeleteResponse(id=str(class_id), message=message))

    #     return results
