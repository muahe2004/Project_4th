from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

from sqlmodel import Session, select

from app.ai.predictor import predict_intent
from app.ai.time_scope_predict import predict_time_scope
from app.models.models import AcademicTerms
from app.models.schemas.ai.intent_schemas import PredictIntentRequest
from app.models.schemas.common.query import BaseQueryParams, DateRange
from app.models.schemas.examination_schedules.examination_schedule_schemas import (
    ExaminationScheduleQueryParams,
)
from app.models.schemas.tuition_fees.tuition_fee_schemas import TuitionFeeQueryParams
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import TeachingScheduleSearchParams
from app.services.examination_schedules import ExaminationScheduleServices
from app.services.scores import ScoresServices
from app.services.teaching_schedules import TeachingScheduleServices
from app.services.tuition_fees import TuitionFeeServices


class AIService:
    INTENT_SERVICE_MAP: dict[str, str] = {
        "learning_schedule": "TeachingScheduleServices",
        "class_learning_schedule": "ClassServices",
        "room_learning_schedule": "RoomServices",
        "teaching_schedule": "TeachingScheduleServices",
        "class_teaching": "TeacherServices",
        "examination_schedule": "ExaminationScheduleServices",
        "tuition_fee": "TuitionFeeServices",
        "student_scores": "ScoresServices",
        "student_gpa": "ScoresServices",
        "students_gpa": "ScoresServices",
    }

    ROLE_ID_FIELD_MAP: dict[str, str] = {
        "student": "student_id",
        "teacher": "teacher_id",
    }

    @staticmethod
    def predict_intent(payload: PredictIntentRequest) -> dict[str, Any]:
        history = [item.model_dump() for item in payload.history]
        result = predict_intent(text=payload.text, role=payload.role, history=history)
        time_scope = predict_time_scope(
            text=payload.text,
            role=payload.role,
            history=history,
            intent=result["intent"],
        )
        result["time_scope"] = time_scope
        return result

    @staticmethod
    def enrich_with_date_range(
        result: dict[str, Any],
        *,
        session: Session | None = None,
    ) -> dict[str, Any]:
        date_range = AIService.get_time_by_scope(
            result.get("time_scope"),
            session=session,
        )
        result["date_range"] = date_range
        return result

    @staticmethod
    def enrich_with_service_data(
        result: dict[str, Any],
        *,
        session: Session | None = None,
        role: str | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        service_context = AIService.call_services_by_intent(
            result.get("intent"),
            role=role,
            user_id=user_id,
        )
        result["service_name"] = service_context["service_name"]
        result["service_data"] = AIService._load_service_data(
            service_context=service_context,
            session=session,
            date_range=result.get("date_range"),
        )
        return result

    @staticmethod
    def get_time_by_scope(
        scope: str | None,
        *,
        session: Session | None = None,
        reference_date: date | None = None,
    ) -> DateRange:
        today = reference_date or datetime.today().date()

        if not scope:
            return DateRange(start_date=today, end_date=today)

        normalized_scope = scope.strip().lower()

        if normalized_scope == "today":
            return DateRange(start_date=today, end_date=today)

        if normalized_scope == "tomorrow":
            next_day = today + timedelta(days=1)
            return DateRange(start_date=next_day, end_date=next_day)

        if normalized_scope == "this_week":
            start_of_week = today - timedelta(days=today.weekday())
            end_of_week = start_of_week + timedelta(days=6)
            return DateRange(start_date=start_of_week, end_date=end_of_week)

        if normalized_scope == "next_week":
            start_of_next_week = today - timedelta(days=today.weekday()) + timedelta(days=7)
            end_of_next_week = start_of_next_week + timedelta(days=6)
            return DateRange(start_date=start_of_next_week, end_date=end_of_next_week)

        if normalized_scope == "this_month":
            start_of_month = today.replace(day=1)
            if today.month == 12:
                next_month = today.replace(year=today.year + 1, month=1, day=1)
            else:
                next_month = today.replace(month=today.month + 1, day=1)
            end_of_month = next_month - timedelta(days=1)
            return DateRange(start_date=start_of_month, end_date=end_of_month)

        if normalized_scope == "current_term":
            return AIService._get_current_term_range(session=session, reference_date=today)

        if normalized_scope == "custom_range":
            return DateRange()

        return DateRange(start_date=today, end_date=today)

    @staticmethod
    def _get_current_term_range(
        *,
        session: Session | None,
        reference_date: date,
    ) -> DateRange:
        if session is None:
            return DateRange()

        current_date = datetime.combine(reference_date, datetime.min.time())
        statement = (
            select(AcademicTerms)
            .where(
                AcademicTerms.start_date <= current_date,
                AcademicTerms.end_date >= current_date,
            )
            .order_by(AcademicTerms.start_date.desc())
        )
        current_term = session.exec(statement).first()
        if current_term is not None:
            return DateRange(
                start_date=current_term.start_date.date(),
                end_date=current_term.end_date.date(),
            )

        latest_statement = select(AcademicTerms).order_by(AcademicTerms.start_date.desc())
        latest_term = session.exec(latest_statement).first()
        if latest_term is not None:
            return DateRange(
                start_date=latest_term.start_date.date(),
                end_date=latest_term.end_date.date(),
            )

        return DateRange()

    @staticmethod
    def call_services_by_intent(
        intent: str | None,
        *,
        role: str | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        if not intent:
            return {
                "service_name": "unknown",
                "user_id_field": "",
                "user_id": "",
            }

        normalized_intent = intent.strip().lower()
        service_name = AIService.INTENT_SERVICE_MAP.get(normalized_intent, "unknown")
        normalized_role = (role or "").strip().lower()
        user_id_field = AIService.ROLE_ID_FIELD_MAP.get(normalized_role, "")

        if service_name == "unknown":
            return {
                "service_name": "unknown",
                "user_id_field": "",
                "user_id": "",
            }

        return {
            "service_name": service_name,
            "user_id_field": user_id_field,
            "user_id": user_id or "",
        }

    @staticmethod
    def _load_service_data(
        *,
        service_context: dict[str, Any],
        session: Session | None,
        date_range: DateRange | None,
    ) -> list[dict[str, Any]]:
        if session is None:
            return []

        service_name = service_context.get("service_name", "unknown")
        user_id_field = service_context.get("user_id_field", "")
        user_id = service_context.get("user_id") or None

        if service_name == "TeachingScheduleServices":
            query_kwargs: dict[str, Any] = {
                "skip": 0,
                "limit": 1000,
                "status": "active",
            }
            if user_id_field and user_id:
                query_kwargs[user_id_field] = user_id
            query = TeachingScheduleSearchParams(**query_kwargs)
            teaching_schedules, _ = TeachingScheduleServices.get_all(
                session=session,
                query=query,
                date_range=date_range or DateRange(),
            )
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in teaching_schedules
            ]

        if service_name == "ExaminationScheduleServices":
            query_kwargs: dict[str, Any] = {
                "skip": 0,
                "limit": 1000,
                "status": "active",
            }
            if user_id_field and user_id:
                query_kwargs[user_id_field] = user_id
            query = ExaminationScheduleQueryParams(**query_kwargs)
            examination_schedules, _ = ExaminationScheduleServices.get_all(
                session=session,
                query=query,
                date_range=date_range or DateRange(),
            )
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in examination_schedules
            ]

        if service_name == "TuitionFeeServices":
            query = TuitionFeeQueryParams(
                skip=0,
                limit=1000,
                status="active",
            )
            tuition_fees, _ = TuitionFeeServices.get_all(
                session=session,
                query=query,
            )
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in tuition_fees
            ]

        if service_name == "ScoresServices":
            if not user_id:
                return []
            try:
                import uuid as uuid_lib

                student_uuid = uuid_lib.UUID(str(user_id))
            except (ValueError, TypeError):
                return []

            from app.models.schemas.scores.score_schemas import StudentScoreFilterParams

            score_response = ScoresServices.get_by_student(
                session=session,
                student_id=student_uuid,
                query=StudentScoreFilterParams(),
            )
            return [score_response.model_dump(mode="json")]

        return []
