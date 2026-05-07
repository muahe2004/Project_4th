import uuid
from datetime import datetime
from app.models.schemas.common.query import BaseQueryParams, DateRange
from app.models.schemas.learning_schedules.learning_schedule_schemas import LearningSchedulePublic
from app.models.schemas.shared.teaching_schedule_embeds import TeachingScheduleInClass, TeachingScheduleRoomInfo, TeachingScheduleSubjectInfo, TeachingScheduleTeacherInfo
from app.enums.class_type import ClassRegistrationStatus, ClassesTypeEnum, ClassTypeEnum
from fastapi import HTTPException, Request
from sqlmodel import Session, and_, or_, select, func, desc
from starlette import status
from typing import List, Tuple
from sqlalchemy import String, cast

from app.models.models import Classes, LearningSchedules, Rooms, StudentClass, Subjects, Teachers, TeachingSchedules
from app.models.models import Specializations
from app.models.schemas.classes.class_schemas import (
    ClassDropDownResponse,
    ClassTeachingResponse,
    ClassPublic,
    ClassCreate,
    ClassQueryParams,
    ClassUpdate,
    ClassDeleteResponse,
    ClassesForRegister,
    ClassesRegisterSchedule,
    ClassesRegisterSpecialization,
    ClassesRegisterTeacher,
    ClassesRegisterSubject,
    ClassWithLearningSchedules,
    ClassesResponse,
)
from app.models.schemas.classes.student_class_schemas import (
    StudentClassPublic,
    StudentClassRegisterRequest,
)
from app.models.models import Students

from app.enums.status import StatusEnum
from app.services.teachers import get_all_teachers
from app.services.common import build_date_conditions


class ClassServices:
    @staticmethod
    def _validate_registration_window(
        registration_open_at: datetime | None,
        registration_close_at: datetime | None,
    ) -> None:
        if (
            registration_open_at is not None
            and registration_close_at is not None
            and registration_open_at > registration_close_at
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="registration_open_at must be less than or equal to registration_close_at.",
            )

    @staticmethod
    def get_all(
        *, session: Session, query: ClassQueryParams
    ) -> Tuple[List[ClassesResponse], int]:
        statement = select(
            Classes.id,
            Classes.class_code,
            Classes.class_name,
            Classes.size,
            Classes.status,
            Classes.class_type,
            Classes.registration_status,
            Classes.subject_id,
            Classes.registration_open_at,
            Classes.registration_close_at,
            Classes.created_at,
            Classes.updated_at,
            Classes.specialization_id,
            Classes.teacher_id,
            Specializations.name.label("specialization_name"),
        ).join(Specializations, Specializations.id == Classes.specialization_id)

        teacher_info = get_all_teachers()
        teacher_map = {str(t["id"]): t["name"] for t in teacher_info}

        conditions = []
        if query.status:
            conditions.append(Classes.status == query.status)

        if query.specialization_id:
            conditions.append(Classes.specialization_id == query.specialization_id)

        if query.teacher_id:
            conditions.append(Classes.teacher_id == query.teacher_id)

        if query.class_type:
            conditions.append(Classes.class_type == query.class_type)

        if query.registration_status:
            conditions.append(Classes.registration_status == query.registration_status)

        if query.search:
            conditions.append(
                or_(
                    Classes.class_code.ilike(f"%{query.search}%"),
                    Classes.class_name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        count_stmt = select(func.count()).select_from(Classes)
        if conditions:
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(Classes.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()

        classes = []
        for r in results:
            data = r._asdict()
            t_id = str(data.get("teacher_id"))
            data["teacher_name"] = teacher_map.get(t_id, "Chưa xác định")
            classes.append(ClassesResponse(**data))

        return classes, total

    @staticmethod
    def get_teaching_classes(
        *, session: Session, query: ClassQueryParams
    ) -> Tuple[List[ClassTeachingResponse], int]:
        statement = (
            select(
                Classes.id,
                Classes.class_code,
                Classes.class_name,
                LearningSchedules.subject_id.label("subject_id"),
                Subjects.subject_code,
                Subjects.name.label("subject_name"),
            )
            .select_from(TeachingSchedules)
            .join(LearningSchedules, LearningSchedules.id == TeachingSchedules.learning_schedule_id)
            .join(Classes, Classes.id == LearningSchedules.class_id)
            .join(Subjects, Subjects.id == LearningSchedules.subject_id)
        )

        conditions = []
        if query.teacher_id:
            conditions.append(TeachingSchedules.teacher_id == query.teacher_id)
        if query.status:
            conditions.append(TeachingSchedules.status == query.status)
        if query.class_type:
            conditions.append(Classes.class_type == query.class_type)
        if query.registration_status:
            conditions.append(Classes.registration_status == query.registration_status)
        if query.search:
            conditions.append(
                or_(
                    Classes.class_code.ilike(f"%{query.search}%"),
                    Classes.class_name.ilike(f"%{query.search}%"),
                )
            )

        if conditions:
            statement = statement.where(and_(*conditions))

        statement = statement.distinct()
        total = session.exec(select(func.count()).select_from(statement.subquery())).one()
        rows = session.exec(
            statement.order_by(Classes.class_code.asc())
            .offset(query.skip)
            .limit(query.limit)
        ).all()

        data = [
            ClassTeachingResponse(
                id=row.id,
                class_code=row.class_code,
                class_name=row.class_name,
                subject_id=row.subject_id,
                subject_code=row.subject_code,
                subject_name=row.subject_name,
            )
            for row in rows
        ]

        return data, total

    @staticmethod
    def get_classes_register(
        *, session: Session, query: ClassQueryParams
    ) -> Tuple[List[ClassesForRegister], int]:
        now = datetime.now()
        conditions = [
            Classes.class_type == ClassesTypeEnum.COURSE_SECTION,
            Classes.registration_status == ClassRegistrationStatus.OPEN,
            or_(
                Classes.registration_open_at.is_(None),
                Classes.registration_open_at <= now,
            ),
            or_(
                Classes.registration_close_at.is_(None),
                Classes.registration_close_at >= now,
            ),
        ]

        if query.status:
            conditions.append(Classes.status == query.status)

        if query.specialization_id:
            conditions.append(Classes.specialization_id == query.specialization_id)

        if query.teacher_id:
            conditions.append(Classes.teacher_id == query.teacher_id)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    Classes.class_code.ilike(search_pattern),
                    Classes.class_name.ilike(search_pattern),
                    Teachers.teacher_code.ilike(search_pattern),
                    Teachers.name.ilike(search_pattern),
                    Specializations.specialization_code.ilike(search_pattern),
                    Specializations.name.ilike(search_pattern),
                )
            )

        base_stmt = (
            select(Classes, Teachers, Specializations, Subjects)
            .select_from(Classes)
            .join(Teachers, Teachers.id == Classes.teacher_id)
            .join(Specializations, Specializations.id == Classes.specialization_id)
            .join(Subjects, Subjects.id == Classes.subject_id)
            .where(and_(*conditions))
        )

        total = session.exec(
            select(func.count()).select_from(base_stmt.subquery())
        ).one()

        statement = (
            base_stmt.order_by(desc(Classes.created_at))
            .offset(query.skip)
            .limit(query.limit)
        )

        rows = session.exec(statement).all()

        class_ids = [class_row.id for class_row, _, _, _ in rows]
        schedules_by_class_id: dict = {}
        registered_class_ids: set[uuid.UUID] = set()

        if class_ids:
            schedule_rows = session.exec(
                select(
                    LearningSchedules.class_id,
                    LearningSchedules.date,
                    LearningSchedules.start_period,
                    LearningSchedules.end_period,
                )
                .where(LearningSchedules.class_id.in_(class_ids))
                .order_by(
                    LearningSchedules.date.asc(),
                    LearningSchedules.start_period.asc(),
                    LearningSchedules.end_period.asc(),
                )
            ).all()

            for schedule_row in schedule_rows:
                schedules_by_class_id.setdefault(schedule_row.class_id, []).append(
                    ClassesRegisterSchedule(
                        date=schedule_row.date,
                        start_period=schedule_row.start_period,
                        end_period=schedule_row.end_period,
                    )
                )

        if query.student_id and class_ids:
            registered_class_ids = set(
                session.exec(
                    select(StudentClass.class_id).where(
                        StudentClass.student_id == query.student_id,
                        StudentClass.class_id.in_(class_ids),
                    )
                ).all()
            )

        classes_register = []
        for class_row, teacher_row, specialization_row, subject_row in rows:
            classes_register.append(
                ClassesForRegister(
                    class_info=ClassPublic.model_validate(class_row),
                    teacher_info=ClassesRegisterTeacher(
                        teacher_id=teacher_row.id,
                        teacher_name=teacher_row.name,
                        teacher_code=teacher_row.teacher_code,
                        teacher_email=teacher_row.email,
                        teacher_phone=teacher_row.phone,
                    ),
                    specialization_info=ClassesRegisterSpecialization(
                        specialization_id=specialization_row.id,
                        specialization_code=specialization_row.specialization_code,
                        specialization_name=specialization_row.name,
                    ),
                    subject_info=ClassesRegisterSubject(
                        subject_id=subject_row.id,
                        subject_code=subject_row.subject_code,
                        subject_name=subject_row.name,
                        subject_credit=subject_row.credit,
                    ),
                    schedule_info=schedules_by_class_id.get(class_row.id, []),
                    is_registered=class_row.id in registered_class_ids,
                )
            )

        return classes_register, total

    # get class and learning schedule
    @staticmethod
    def get_class_and_learning_schedule(
        *, session: Session, query: BaseQueryParams, date_range: DateRange
    ) -> Tuple[List[ClassWithLearningSchedules], int]:

        conditions = []
        schedule_conditions = build_date_conditions(date_range)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    cast(Classes.class_code, String).ilike(search_pattern),
                    cast(Classes.class_name, String).ilike(search_pattern),
                )
            )

        count_stmt = select(func.count(Classes.id))

        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))

        total = session.exec(count_stmt).one()

        class_stmt = select(Classes)

        if conditions:
            class_stmt = class_stmt.where(and_(*conditions))

        class_stmt = (
            class_stmt
            .order_by(desc(Classes.created_at))
            .offset(query.skip)
            .limit(query.limit)
        )

        classes = session.exec(class_stmt).all()

        if not classes:
            return [], total

        class_ids = [r.id for r in classes]

        stmt = (
            select(
                Classes.id.label("class_id"),

                TeachingSchedules.id.label("ts_id"),
                TeachingSchedules.status.label("ts_status"),
                TeachingSchedules.created_at.label("ts_created_at"),
                TeachingSchedules.updated_at.label("ts_updated_at"),

                LearningSchedules.id.label("ls_id"),
                LearningSchedules.class_id.label("ls_class_id"),
                LearningSchedules.subject_id.label("ls_subject_id"),
                LearningSchedules.date.label("ls_date"),
                LearningSchedules.start_period.label("ls_start_period"),
                LearningSchedules.end_period.label("ls_end_period"),
                LearningSchedules.created_at.label("ls_created_at"),
                LearningSchedules.updated_at.label("ls_updated_at"),

                Rooms.id.label("room_id"),
                Rooms.room_number.label("room_number"),

                Teachers.id.label("teacher_id"),
                Teachers.name.label("teacher_name"),
                Teachers.email.label("teacher_email"),
                Teachers.phone.label("teacher_phone"),

                Subjects.id.label("subject_id"),
                Subjects.name.label("subject_name"),
                Subjects.subject_code.label("subject_code"),
            )
            .select_from(Classes)
            .outerjoin(
                LearningSchedules,
                LearningSchedules.class_id == Classes.id
            )
            .outerjoin(
                TeachingSchedules,
                TeachingSchedules.learning_schedule_id == LearningSchedules.id
            )
            .outerjoin(Rooms, Rooms.id == LearningSchedules.room_id)
            .outerjoin(Teachers, Teachers.id == TeachingSchedules.teacher_id)
            .outerjoin(Subjects, Subjects.id == LearningSchedules.subject_id)
            .where(Classes.id.in_(class_ids))
        )

        if schedule_conditions:
            stmt = stmt.where(and_(*schedule_conditions))

        rows = session.exec(stmt).all()

        classes_map = {}

        for r in classes:
            classes_map[r.id] = ClassWithLearningSchedules(
                class_information=ClassPublic.model_validate(r),
                teaching_schedules=[]
            )

        for row in rows:

            if row.ls_id is None:
                continue

            schedule_item = TeachingScheduleInClass(
                id=row.ts_id or row.ls_id,
                status=row.ts_status,  
                created_at=row.ts_created_at or row.ls_created_at,
                updated_at=row.ts_updated_at or row.ls_updated_at,

                learning_schedule=LearningSchedulePublic(
                    id=row.ls_id,
                    class_id=row.ls_class_id,
                    subject_id=row.ls_subject_id,
                    date=row.ls_date,
                    start_period=row.ls_start_period,
                    end_period=row.ls_end_period,
                    created_at=row.ls_created_at,
                    updated_at=row.ls_updated_at,
                ),

                room = (
                    TeachingScheduleRoomInfo(
                        room_id=row.room_id,
                        room_number=row.room_number,
                    )
                    if row.room_id else None
                ),

                teacher=(
                    TeachingScheduleTeacherInfo(
                        teacher_id=row.teacher_id,
                        teacher_name=row.teacher_name,
                        teacher_email=row.teacher_email,
                        teacher_phone=row.teacher_phone,
                    )
                    if row.teacher_id else None
                ),

                subject=(
                    TeachingScheduleSubjectInfo(
                        subject_id=row.subject_id,
                        subject_name=row.subject_name,
                        subject_code=row.subject_code,
                    )
                    if row.subject_id else None
                ),
            )

            classes_map[row.class_id].teaching_schedules.append(schedule_item)

        return list(classes_map.values()), total

    @staticmethod
    def get_dropdown(
        *, session: Session, query: ClassQueryParams
    ) -> List[ClassDropDownResponse]:
        statement = select(Classes)

        conditions = []

        if query.status:
            conditions.append(Classes.status == query.status)

        if query.class_type:
            conditions.append(Classes.class_type == query.class_type)

        if query.registration_status:
            conditions.append(Classes.registration_status == query.registration_status)

        if query.search:
            search_pattern = f"%{query.search}%"
            conditions.append(
                or_(
                    Classes.class_code.ilike(search_pattern),
                    Classes.class_name.ilike(search_pattern),
                )
            )

        if conditions:
            statement = statement.where(and_(*conditions))

        statement = statement.order_by(desc(Classes.created_at))
        statement = statement.offset(query.skip).limit(query.limit)

        results = session.exec(statement).all()

        return [ClassDropDownResponse.model_validate(t) for t in results]

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
    def get_dropdown_by_ids(
        *, session: Session, ids: List[uuid.UUID], request: Request
    ) -> List[ClassDropDownResponse]:
        if not ids:
            return []

        statement = select(Classes).where(Classes.id.in_(ids))
        classes = session.exec(statement).all()

        return [ClassDropDownResponse.model_validate(c) for c in classes]

    @staticmethod
    def create(
        *,
        session: Session,
        class_: ClassCreate,
    ) -> ClassPublic:
        ClassServices._validate_registration_window(
            class_.registration_open_at,
            class_.registration_close_at,
        )
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

        next_open_at = (
            class_data.registration_open_at
            if "registration_open_at" in class_data.model_fields_set
            else class_.registration_open_at
        )
        next_close_at = (
            class_data.registration_close_at
            if "registration_close_at" in class_data.model_fields_set
            else class_.registration_close_at
        )
        ClassServices._validate_registration_window(next_open_at, next_close_at)

        update_data = class_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(class_, field, value)

        session.commit()
        return ClassPublic.model_validate(class_)

    @staticmethod
    def delete_many(
        *, session: Session, class_ids: List[uuid.UUID]
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
                        message="Class has students and cannot be deleted.",
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

    @staticmethod
    def register_course_section(
        *,
        session: Session,
        class_register: StudentClassRegisterRequest
    ) -> List[StudentClassPublic]:
        if not class_register.course_sections:
            return []

        seen_class_ids: set[uuid.UUID] = set()
        new_student_classes: list[StudentClass] = []
        now = datetime.now()

        for course_section in class_register.course_sections:
            if course_section.class_id in seen_class_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Duplicate class in request payload.",
                )
            seen_class_ids.add(course_section.class_id)

            target_class = session.get(Classes, course_section.class_id)
            if not target_class:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Class not found",
                )

            if target_class.class_type != ClassesTypeEnum.COURSE_SECTION:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Class is not available for registration.",
                )

            if target_class.registration_status != ClassRegistrationStatus.OPEN:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Class registration is closed.",
                )

            if (
                target_class.registration_open_at is not None
                and target_class.registration_open_at > now
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Class registration has not opened yet.",
                )

            if (
                target_class.registration_close_at is not None
                and target_class.registration_close_at < now
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Class registration is closed.",
                )

            existing = session.exec(
                select(StudentClass).where(
                    StudentClass.class_id == course_section.class_id,
                    StudentClass.student_id == class_register.student_id,
                )
            ).first()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Student already exists in class.",
                )

            new_student_classes.append(
                StudentClass(
                    student_id=class_register.student_id,
                    class_id=course_section.class_id,
                    status=course_section.status,
                    class_type=course_section.class_type,
                    created_at=class_register.created_at,
                    updated_at=class_register.updated_at,
                )
            )

        session.add_all(new_student_classes)
        session.commit()

        for new_student_class in new_student_classes:
            session.refresh(new_student_class)

        return [StudentClassPublic.model_validate(item) for item in new_student_classes]
