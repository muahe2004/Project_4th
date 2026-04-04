from datetime import datetime, time
from datetime import date as date_type
from typing import Any

from app.models.models import LearningSchedules
from app.models.schemas.common.query import DateRange


def build_date_conditions(date_range: DateRange):
    conditions = []

    if date_range.start_date is not None:
        conditions.append(
            LearningSchedules.date >= datetime.combine(date_range.start_date, time.min)
        )

    if date_range.end_date is not None:
        conditions.append(
            LearningSchedules.date <= datetime.combine(date_range.end_date, time.max)
        )

    return conditions


def build_date_conditions_for_column(date_range: DateRange, date_column: Any):
    conditions = []

    if date_range.start_date is not None:
        conditions.append(
            date_column >= datetime.combine(date_range.start_date, time.min)
        )

    if date_range.end_date is not None:
        conditions.append(
            date_column <= datetime.combine(date_range.end_date, time.max)
        )

    return conditions


def to_clean_text(raw_value: object) -> str | None:
    if raw_value is None or raw_value == "":
        return None
    if isinstance(raw_value, float) and raw_value.is_integer():
        return str(int(raw_value))
    return str(raw_value).strip() or None


def parse_excel_datetime(raw_value: object) -> datetime | None:
    if raw_value is None or raw_value == "":
        return None

    if isinstance(raw_value, datetime):
        return raw_value

    if isinstance(raw_value, date_type):
        return datetime.combine(raw_value, datetime.min.time())

    text_value = str(raw_value).strip()
    if not text_value:
        return None

    accepted_formats = (
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
        "%d/%m/%Y %H:%M:%S",
        "%d-%m-%Y %H:%M:%S",
    )
    for fmt in accepted_formats:
        try:
            return datetime.strptime(text_value, fmt)
        except ValueError:
            continue

    raise ValueError(f"Invalid date format: {text_value}")
