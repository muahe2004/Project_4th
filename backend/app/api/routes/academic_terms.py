from fastapi import APIRouter
from typing import Optional

from app.api.deps import SessionDep
from app.models.schemas.academic_terms.academic_term_schemas import AcademicTermGroup
from app.services.academic_terms import AcademicTermServices

router = APIRouter()


@router.get("", response_model=list[AcademicTermGroup])
def get_academic_terms(
    session: SessionDep,
    academic_year_start: Optional[int] = None,
) -> list[AcademicTermGroup]:
    return AcademicTermServices.get_grouped(
        session=session,
        academic_year_start=academic_year_start,
    )
