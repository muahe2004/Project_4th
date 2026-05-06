import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, func, or_, select
from starlette import status
from typing import List

from app.models.models import (
    AcademicTerms,
    Classes,
    ScoreComponents,
    Scores,
    StudentClass,
    Students,
    Subjects,
)
from app.models.schemas.scores.score_schemas import (
    ScoreByClassSubjectParams,
    ScoreByClassSubjectResponse,
    ScoreAggregationBucket,
    ScorePointItem,
    StudentAndGpaListItem,
    StudentAndGpaListResponse,
    ScoresPublic,
    ScoresCreate,
    ScoresUpdate,
    ScoresDeleteResponse,
    StudentScoreByClassSubjectItem,
    StudentScoreByStudentResponse,
    StudentScoreFilterParams,
    StudentAndGpaResponse,
    StudentGpaClassInfo,
    StudentGpaSummary,
    StudentScoreItemResponse,
    StudentScoreComponentResponse,
    StudentInfoScoreResponse,
    StudentScoresPayload,
)
from app.enums.status import StatusEnum
from app.enums.grade import (
    GRADE_SCALE_THRESHOLDS,
    GradeRankEnum,
    ScoreComponentTypeEnum,
    ScoreTypeEnum,
    GradeScaleEnum
)


class ScoresServices:
    @staticmethod
    def _build_student_gpa_payload(
        *, session: Session, student: Students
    ) -> StudentAndGpaListItem:
        from app.services.students import StudentServices

        class_id = StudentServices._get_primary_class_id(
            session=session,
            student_id=student.id,
        )

        class_code = None
        class_name = None
        if class_id is not None:
            class_ = session.get(Classes, class_id)
            if class_ is not None:
                class_code = class_.class_code
                class_name = class_.class_name

        # reuse the same GPA logic as the single-student endpoint
        single = ScoresServices.get_student_and_gpa(session=session, student_id=student.id)
        return StudentAndGpaListItem(
            student_info=single.student_info,
            class_info=StudentGpaClassInfo(
                class_id=class_id,
                class_code=class_code,
                class_name=class_name,
            ),
            gpa=single.gpa,
        )

    @staticmethod
    def get_student_and_gpa(
        *, session: Session, student_id: uuid.UUID
    ) -> StudentAndGpaResponse:
        student = session.get(Students, student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
            )

        from app.services.students import StudentServices

        class_id = StudentServices._get_primary_class_id(
            session=session,
            student_id=student.id,
        )

        class_code = None
        class_name = None
        if class_id is not None:
            class_ = session.get(Classes, class_id)
            if class_ is not None:
                class_code = class_.class_code
                class_name = class_.class_name

        def normalize_score_text(value: str) -> str:
            return value.upper().strip()

        def is_retake_score(score_type: str, attempt: int) -> bool:
            score_type_normalized = normalize_score_text(score_type or "")
            if score_type_normalized == ScoreTypeEnum.RETAKE.value.upper():
                return True
            if score_type_normalized == ScoreTypeEnum.OFFICIAL.value.upper():
                return False
            return attempt > 1

        def is_midterm_component(component_type: str) -> bool:
            return normalize_score_text(component_type) == ScoreComponentTypeEnum.MIDDLE.value.upper()

        def is_final_component(component_type: str) -> bool:
            return normalize_score_text(component_type) == ScoreComponentTypeEnum.FINAL.value.upper()

        def is_other_component(component_type: str) -> bool:
            return normalize_score_text(component_type) == ScoreComponentTypeEnum.OTHER.value.upper()

        def to_normalized_weight(weight: float) -> float:
            if weight > 1:
                return weight / 100
            if weight < 0:
                return 0
            return weight

        def score10_to_scale(value: float) -> tuple[float, str]:
            for min_score, avg4_value, letter in GRADE_SCALE_THRESHOLDS:
                if value >= min_score:
                    return avg4_value, letter.value
            return 0.0, GradeScaleEnum.F

        score_rows = session.exec(
            select(
                Scores,
                ScoreComponents.component_type.label("component_type"),
                ScoreComponents.weight.label("component_weight"),
                AcademicTerms.academic_year.label("academic_year"),
                AcademicTerms.semester.label("semester"),
            )
            .join(ScoreComponents, ScoreComponents.id == Scores.score_component_id)
            .join(AcademicTerms, AcademicTerms.id == Scores.academic_term_id)
            .where(Scores.student_id == student.id)
            .order_by(Scores.created_at.desc())
        ).all()

        aggregated: dict[str, ScoreAggregationBucket] = {}
        for score, component_type, component_weight, academic_year, semester in score_rows:
            if score.status is not None and normalize_score_text(str(score.status)) != "ACTIVE":
                continue

            key = f"{score.subject_id}-{score.academic_term_id}"
            bucket = aggregated.setdefault(
                key,
                ScoreAggregationBucket(
                    subject_id=score.subject_id,
                    academic_term_id=score.academic_term_id,
                    academic_year=academic_year,
                    semester=semester,
                ),
            )
            bucket.points.append(
                ScorePointItem(
                    score=score.score,
                    weight=component_weight,
                    attempt=score.attempt,
                    score_type=score.score_type,
                    component_type=component_type,
                )
            )

        has_any_score = False
        studied_credits = 0
        accumulated_credits = 0
        gpa_weighted_10 = 0.0
        gpa_weighted_4 = 0.0
        gpa_weight_sum = 0.0

        for bucket in aggregated.values():
            subject = session.get(Subjects, bucket.subject_id)
            if subject is None:
                continue

            studied_credits += subject.credit or 0

            points = bucket.points
            official_mid: list[ScorePointItem] = []
            official_final: ScorePointItem | None = None
            retake_mid: list[ScorePointItem] = []
            retake_final: ScorePointItem | None = None

            for point in points:
                is_retake = is_retake_score(point.score_type, point.attempt)
                component_type = point.component_type
                if is_retake:
                    if is_final_component(component_type):
                        retake_final = point
                    elif is_midterm_component(component_type):
                        retake_mid.append(point)
                    elif is_other_component(component_type) and len(retake_mid) < 2:
                        retake_mid.append(point)
                    else:
                        retake_final = point
                else:
                    if is_final_component(component_type):
                        official_final = point
                    elif is_midterm_component(component_type):
                        official_mid.append(point)
                    elif is_other_component(component_type) and len(official_mid) < 2:
                        official_mid.append(point)
                    else:
                        official_final = point

            selected_mid1 = retake_mid[0] if len(retake_mid) > 0 else (official_mid[0] if len(official_mid) > 0 else None)
            selected_mid2 = retake_mid[1] if len(retake_mid) > 1 else (official_mid[1] if len(official_mid) > 1 else None)
            selected_final = retake_final or official_final
            selected_points = [p for p in [selected_mid1, selected_mid2, selected_final] if p is not None]
            if not selected_points:
                continue
            has_any_score = True

            normalized_weight_sum = sum(to_normalized_weight(p.weight) for p in selected_points)
            if normalized_weight_sum > 0:
                avg10 = sum(
                    p.score * to_normalized_weight(p.weight)
                    for p in selected_points
                ) / normalized_weight_sum
            else:
                avg10 = sum(p.score for p in selected_points) / len(selected_points)

            avg10 = round(avg10, 2)
            avg4, letter = score10_to_scale(avg10)

            gpa_weighted_10 += avg10 * (subject.credit or 0)
            gpa_weighted_4 += avg4 * (subject.credit or 0)
            gpa_weight_sum += subject.credit or 0

            if avg10 >= 4.0:
                accumulated_credits += subject.credit or 0

        gpa10 = round(gpa_weighted_10 / gpa_weight_sum, 2) if gpa_weight_sum > 0 else 0.0
        gpa4 = round(gpa_weighted_4 / gpa_weight_sum, 2) if gpa_weight_sum > 0 else 0.0

        def classify_gpa4(value: float) -> str:
            if not has_any_score:
                return GradeRankEnum.NOT_RANKED
            if value >= 3.6:
                return GradeRankEnum.EXCELLENT
            if value >= 3.2:
                return GradeRankEnum.GOOD
            if value >= 2.5:
                return GradeRankEnum.FAIR
            if value >= 2.0:
                return GradeRankEnum.AVERAGE
            return GradeRankEnum.POOR

        def classify_gpa10(value: float) -> str:
            if not has_any_score:
                return GradeRankEnum.NOT_RANKED
            if value >= 9.0:
                return GradeRankEnum.EXCELLENT
            if value >= 8.0:
                return GradeRankEnum.GOOD
            if value >= 6.5:
                return GradeRankEnum.FAIR
            if value >= 5.0:
                return GradeRankEnum.AVERAGE
            return GradeRankEnum.POOR

        return StudentAndGpaResponse(
            student_info=StudentInfoScoreResponse(
                id=student.id,
                student_code=student.student_code,
                name=student.name,
                email=student.email,
                phone=student.phone,
            ),
            class_info=StudentGpaClassInfo(
                class_id=class_id,
                class_code=class_code,
                class_name=class_name,
            ),
            gpa=StudentGpaSummary(
                grade4=classify_gpa4(gpa4),
                grade10=classify_gpa10(gpa10),
                gpa4=gpa4,
                accumulated_gpa4=gpa4,
                accumulated_gpa10=gpa10,
                accumulated_credits=accumulated_credits,
                studied_credits=studied_credits,
            ),
        )

    @staticmethod
    def get_students_and_gpa(
        *, session: Session, query
    ) -> StudentAndGpaListResponse:
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
                student_id for student_id in student_ids_by_class if student_id is not None
            ]
            if not filtered_student_ids:
                return StudentAndGpaListResponse(data=[], total=0)
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

        student_rows = session.exec(
            statement.order_by(Students.created_at.desc()).offset(query.skip).limit(query.limit)
        ).all()

        data = [
            ScoresServices._build_student_gpa_payload(session=session, student=student)
            for student in student_rows
        ]
        return StudentAndGpaListResponse(data=data, total=total)

    @staticmethod
    def get_all(
        *,
        session: Session,
    ) -> List[ScoresPublic]:
        scores = session.exec(select(Scores)).all()
        return scores

    @staticmethod
    def get_by_id(
        *, session: Session, score_id: uuid.UUID, request: Request
    ) -> ScoresPublic:
        score = session.get(Scores, score_id)
        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Score does not exist"
            )
        return ScoresPublic.model_validate(score)

    @staticmethod
    def get_by_student(
        *,
        session: Session,
        student_id: uuid.UUID,
        query: StudentScoreFilterParams,
    ) -> StudentScoreByStudentResponse:
        student = session.get(Students, student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
            )

        statement = (
            select(
                Scores,
                ScoreComponents.id.label("component_id"),
                ScoreComponents.component_type.label("component_type"),
                ScoreComponents.weight.label("component_weight"),
                ScoreComponents.description.label("component_description"),
                Subjects.subject_code.label("subject_code"),
                Subjects.name.label("subject_name"),
                Subjects.credit.label("subject_credit"),
                AcademicTerms.academic_year.label("academic_year"),
                AcademicTerms.semester.label("semester"),
            )
            .join(ScoreComponents, ScoreComponents.id == Scores.score_component_id)
            .join(Subjects, Subjects.id == Scores.subject_id)
            .join(AcademicTerms, AcademicTerms.id == Scores.academic_term_id)
            .where(Scores.student_id == student_id)
        )

        if query.academic_term_id:
            statement = statement.where(Scores.academic_term_id == query.academic_term_id)

        if query.subject_id:
            statement = statement.where(Scores.subject_id == query.subject_id)

        rows = session.exec(statement.order_by(Scores.created_at.desc())).all()

        score_items: list[StudentScoreItemResponse] = []
        for (
            score,
            component_id,
            component_type,
            component_weight,
            component_description,
            subject_code,
            subject_name,
            subject_credit,
            academic_year,
            semester,
        ) in rows:
            score_items.append(
                StudentScoreItemResponse(
                    id=score.id,
                    subject_id=score.subject_id,
                    subject_code=subject_code,
                    subject_name=subject_name,
                    subject_credit=subject_credit,
                    academic_term_id=score.academic_term_id,
                    academic_year=academic_year,
                    semester=semester,
                    score=score.score,
                    attempt=score.attempt,
                    score_type=score.score_type,
                    status=score.status,
                    created_at=score.created_at,
                    updated_at=score.updated_at,
                    score_component=StudentScoreComponentResponse(
                        id=component_id,
                        component_type=component_type,
                        weight=component_weight,
                        description=component_description,
                    ),
                )
            )

        return StudentScoreByStudentResponse(
            student_info=StudentInfoScoreResponse(
                id=student.id,
                student_code=student.student_code,
                name=student.name,
                email=student.email,
                phone=student.phone,
            ),
            scores=StudentScoresPayload(
                items=score_items,
                total=len(score_items),
            ),
        )

    @staticmethod
    def get_by_class_subject(
        *,
        session: Session,
        query: ScoreByClassSubjectParams,
    ) -> ScoreByClassSubjectResponse:
        class_ = session.get(Classes, query.class_id)
        if not class_:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found"
            )

        subject = session.get(Subjects, query.subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
            )

        student_ids_rows = session.exec(
            select(StudentClass.student_id).where(
                StudentClass.class_id == query.class_id,
                or_(
                    StudentClass.status == StatusEnum.ACTIVE,
                    StudentClass.status.is_(None),
                ),
            )
        ).all()

        student_ids: list[uuid.UUID] = []
        for student_id in student_ids_rows:
            if student_id is None:
                continue
            if student_id not in student_ids:
                student_ids.append(student_id)

        if not student_ids:
            return ScoreByClassSubjectResponse(
                class_id=class_.id,
                class_name=class_.class_name,
                subject_id=subject.id,
                subject_name=subject.name,
                students=[],
                total_students=0,
            )

        students = session.exec(
            select(Students)
            .where(Students.id.in_(student_ids))
            .order_by(Students.name.asc())
        ).all()

        score_rows = session.exec(
            select(
                Scores,
                ScoreComponents.id.label("component_id"),
                ScoreComponents.component_type.label("component_type"),
                ScoreComponents.weight.label("component_weight"),
                ScoreComponents.description.label("component_description"),
                AcademicTerms.academic_year.label("academic_year"),
                AcademicTerms.semester.label("semester"),
            )
            .join(ScoreComponents, ScoreComponents.id == Scores.score_component_id)
            .join(AcademicTerms, AcademicTerms.id == Scores.academic_term_id)
            .where(
                Scores.student_id.in_(student_ids),
                Scores.subject_id == query.subject_id,
                or_(
                    Scores.status == StatusEnum.ACTIVE,
                    Scores.status.is_(None),
                ),
            )
            .order_by(Scores.student_id, Scores.created_at.desc())
        ).all()

        scores_by_student: dict[uuid.UUID, list[StudentScoreItemResponse]] = {}
        for (
            score,
            component_id,
            component_type,
            component_weight,
            component_description,
            academic_year,
            semester,
        ) in score_rows:
            if score.student_id is None:
                continue

            scores_by_student.setdefault(score.student_id, []).append(
                StudentScoreItemResponse(
                    id=score.id,
                    subject_id=score.subject_id,
                    subject_code=subject.subject_code,
                    subject_name=subject.name,
                    subject_credit=subject.credit,
                    academic_term_id=score.academic_term_id,
                    academic_year=academic_year,
                    semester=semester,
                    score=score.score,
                    attempt=score.attempt,
                    score_type=score.score_type,
                    status=score.status,
                    created_at=score.created_at,
                    updated_at=score.updated_at,
                    score_component=StudentScoreComponentResponse(
                        id=component_id,
                        component_type=component_type,
                        weight=component_weight,
                        description=component_description,
                    ),
                )
            )

        student_items = [
            StudentScoreByClassSubjectItem(
                student_info=StudentInfoScoreResponse(
                    id=student.id,
                    student_code=student.student_code,
                    name=student.name,
                    email=student.email,
                    phone=student.phone,
                ),
                scores=scores_by_student.get(student.id, []),
            )
            for student in students
        ]

        return ScoreByClassSubjectResponse(
            class_id=class_.id,
            class_name=class_.class_name,
            subject_id=subject.id,
            subject_name=subject.name,
            students=student_items,
            total_students=len(student_items),
        )

    @staticmethod
    def create(
        *,
        session: Session,
        score: ScoresCreate,
    ) -> ScoresPublic:
        existing = session.exec(
            select(Scores).where(
                Scores.student_id == score.student_id,
                Scores.score_component_id == score.score_component_id,
                Scores.attempt == score.attempt,
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Score already exists.",
            )

        new_score = Scores(**score.dict())
        session.add(new_score)
        session.commit()
        session.refresh(new_score)

        return new_score

    @staticmethod
    def update(
        *, session: Session, score_id: uuid.UUID, score_data: ScoresUpdate
    ) -> ScoresPublic:
        score = session.get(Scores, score_id)
        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Score not found"
            )

        update_data = score_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(score, field, value)

        session.commit()
        session.refresh(score)
        if score.score_type is None:
            score.score_type = ScoreTypeEnum.OFFICIAL.value.capitalize()

        return ScoresPublic.model_validate(score)

    @staticmethod
    def delete(*, session: Session, score_id: uuid.UUID) -> ScoresDeleteResponse:
        score = session.get(Scores, score_id)
        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Score not found"
            )

        if score.status == StatusEnum.ACTIVE:
            score.status = StatusEnum.INACTIVE
            session.commit()
            return ScoresDeleteResponse(
                id=str(score.id), message="Score set to inactive"
            )

        session.delete(score)
        session.commit()

        return ScoresDeleteResponse(
            id=str(score.id), message="Score deleted successfully"
        )
