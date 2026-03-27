from datetime import datetime, time

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
