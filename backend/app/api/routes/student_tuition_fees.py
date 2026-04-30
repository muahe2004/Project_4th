from fastapi import APIRouter
from fastapi import Depends

from app.api.deps import SessionDep
from app.models.schemas.common.query import BaseQueryParams
from app.models.schemas.tuition_fees.student_tuition_fee_schemas import (
    StudentTuitionFeeBulkCreateRequest,
    StudentTuitionFeeBulkCreateResponse,
    StudentWithTuitionFeesListResponse,
)
from app.services.student_tuition_fees import StudentTuitionFeeServices

router = APIRouter()



# =========================== add student tuition fee ===========================
@router.post(
    "/bulk-by-tuition-fee",
    response_model=StudentTuitionFeeBulkCreateResponse,
)
def create_student_tuition_fees_by_tuition_fee(
    session: SessionDep,
    data: StudentTuitionFeeBulkCreateRequest,
):
    return StudentTuitionFeeServices.create_many_by_tuition_fee(
        session=session,
        payload=data,
    )


# =========================== get students with tuition fees ===========================
@router.get(
    "/students-with-tuition-fees",
    response_model=StudentWithTuitionFeesListResponse,
)
def get_students_with_tuition_fees(
    session: SessionDep,
    query: BaseQueryParams = Depends(),
):
    return StudentTuitionFeeServices.get_students_with_tuition_fees(
        session=session,
        skip=query.skip,
        limit=query.limit,
        search=query.search,
    )
