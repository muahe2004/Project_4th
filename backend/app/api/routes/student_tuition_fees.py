from fastapi import APIRouter

from app.api.deps import SessionDep
from app.models.schemas.tuition_fees.student_tuition_fee_schemas import (
    StudentTuitionFeeBulkCreateRequest,
    StudentTuitionFeeBulkCreateResponse,
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
