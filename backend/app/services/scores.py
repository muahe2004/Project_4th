import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, or_, select
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
    ScoresPublic,
    ScoresCreate,
    ScoresUpdate,
    ScoresDeleteResponse,
    StudentScoreByClassSubjectItem,
    StudentScoreByStudentResponse,
    StudentScoreFilterParams,
    StudentScoreItemResponse,
    StudentScoreComponentResponse,
    StudentInfoScoreResponse,
    StudentScoresPayload,
)
from app.enums.status import StatusEnum


class ScoresServices:
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
