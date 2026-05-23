from __future__ import annotations

from datetime import date, datetime
from typing import Any

from sqlmodel import Session

from app.ai.predictor import predict_intent
from app.models.schemas.ai.intent_schemas import PredictIntentRequest
from app.models.schemas.common.query import BaseQueryParams, DateRange
from app.models.schemas.classes.class_schemas import ClassQueryParams
from app.models.schemas.examination_schedules.examination_schedule_schemas import (
    ExaminationScheduleQueryParams,
)
from app.models.schemas.majors.major_schemas import MajorQueryParams
from app.models.schemas.specializations.specialization_schemas import (
    SpecializationQueryParams,
)
from app.models.schemas.tuition_fees.tuition_fee_schemas import TuitionFeeQueryParams
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import TeachingScheduleSearchParams
from app.models.schemas.training_program.training_program_create_schemas import (
    TrainingProgramQueryParams,
)
from app.services.classes import ClassServices
from app.services.departments import DepartmentServices
from app.services.examination_schedules import ExaminationScheduleServices
from app.services.majors import MajorServices
from app.services.rooms import RoomServices
from app.services.scores import ScoresServices
from app.services.specializations import SpecializationServices
from app.services.subjects import SubjectServices
from app.services.teaching_schedules import TeachingScheduleServices
from app.services.training_programs import TrainingProgramServices
from app.services.tuition_fees import TuitionFeeServices


class AIService:
    INTENT_I18N_META: dict[str, dict[str, str]] = {
        "role_unsupported": {
            "message_key": "chatbot.intent.role_unsupported",
            "title_key": "chatbot.intent.role_unsupported.title",
        },
        "out_of_scope": {
            "message_key": "chatbot.intent.out_of_scope",
            "title_key": "chatbot.intent.out_of_scope.title",
        },
    }

    INTENT_SERVICE_MAP: dict[str, str] = {
        "department_info": "DepartmentServices",
        "major_info": "MajorServices",
        "specialization_info": "SpecializationServices",
        "class_info": "ClassServices",
        "learning_schedule": "TeachingScheduleServices",
        "class_learning_schedule": "ClassServices",
        "room_info": "RoomServices",
        "room_learning_schedule": "RoomServices",
        "subject_info": "SubjectServices",
        "training_program_info": "TrainingProgramServices",
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
        result = predict_intent(text=payload.message)
        result["time_scope"] = "today"
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
        intent = str(result.get("intent") or "").strip().lower()
        if intent in AIService.INTENT_I18N_META:
            result["service_name"] = "unknown"
            result["service_data"] = [AIService.INTENT_I18N_META[intent]]
            return result

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
        return DateRange(start_date=today, end_date=today)

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
        if "." in normalized_role:
            normalized_role = normalized_role.split(".")[-1]

        user_id_field = AIService.ROLE_ID_FIELD_MAP.get(normalized_role, "")
        if normalized_intent == "examination_schedule" and normalized_role == "teacher":
            user_id_field = "invigilator_id"

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

        if service_name == "DepartmentServices":
            query = BaseQueryParams(skip=0, limit=1000, status="active")
            departments, _ = DepartmentServices.get_all(session=session, query=query)
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in departments
            ]

        if service_name == "MajorServices":
            query = MajorQueryParams(skip=0, limit=1000, status="active")
            majors, _ = MajorServices.get_all(session=session, query=query)
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in majors
            ]

        if service_name == "SpecializationServices":
            query = SpecializationQueryParams(skip=0, limit=1000, status="active")
            specializations, _ = SpecializationServices.get_all(session=session, query=query)
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in specializations
            ]

        if service_name == "ClassServices":
            query = ClassQueryParams(skip=0, limit=1000, status="active")
            classes, _ = ClassServices.get_all(session=session, query=query)
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in classes
            ]

        if service_name == "RoomServices":
            query = BaseQueryParams(skip=0, limit=1000, status="active")
            rooms, _ = RoomServices.get_all(session=session, query=query)
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in rooms
            ]

        if service_name == "SubjectServices":
            query = BaseQueryParams(skip=0, limit=1000, status="active")
            subjects, _ = SubjectServices.get_all(session=session, query=query)
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in subjects
            ]

        if service_name == "TrainingProgramServices":
            query = TrainingProgramQueryParams(skip=0, limit=1000, status="active")
            training_programs = TrainingProgramServices.get_training_programs(
                session=session,
                query=query,
            )
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in training_programs.data
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
            tuition_fee_response = TuitionFeeServices.get_all(
                session=session,
                query=query,
            )
            return [
                item.model_dump(mode="json") if hasattr(item, "model_dump") else dict(item)
                for item in tuition_fee_response.data
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
