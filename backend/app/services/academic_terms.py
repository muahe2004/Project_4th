from sqlmodel import Session, select

from app.models.models import AcademicTerms
from app.models.schemas.academic_terms.academic_term_schemas import (
    AcademicTermGroup,
    AcademicTermGroupItem,
)


class AcademicTermServices:
    @staticmethod
    def _parse_academic_year(value: str) -> tuple[int, int] | None:
        parts = [part.strip() for part in value.split("-")]
        if len(parts) != 2:
            return None
        try:
            start_year = int(parts[0])
            end_year = int(parts[1])
        except ValueError:
            return None
        return start_year, end_year

    @staticmethod
    def get_grouped(
        *,
        session: Session,
        academic_year_start: int | None = None,
    ) -> list[AcademicTermGroup]:
        statement = select(AcademicTerms)
        if academic_year_start is not None:
            rows = session.exec(
                statement.order_by(AcademicTerms.academic_year.desc(), AcademicTerms.semester.asc())
            ).all()
            filtered_rows = []
            for term in rows:
                parsed = AcademicTermServices._parse_academic_year(term.academic_year)
                if parsed is None:
                    continue
                start_year, end_year = parsed
                if start_year <= academic_year_start <= end_year:
                    filtered_rows.append(term)
            rows = filtered_rows
        else:
            rows = session.exec(
                statement.order_by(AcademicTerms.academic_year.desc(), AcademicTerms.semester.asc())
            ).all()

        grouped: dict[str, AcademicTermGroup] = {}
        for term in rows:
            group = grouped.setdefault(
                term.academic_year,
                AcademicTermGroup(academic_year=term.academic_year, terms=[]),
            )
            group.terms.append(
                AcademicTermGroupItem(
                    id=term.id,
                    semester=term.semester,
                    start_date=term.start_date,
                    end_date=term.end_date,
                    status=term.status,
                )
            )

        return list(grouped.values())
