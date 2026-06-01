from fastapi import APIRouter, Request

from app.api.deps import SessionDep
from app.models.schemas.vnpay.vnpay_schemas import (
    VnpayCreatePaymentRequest,
    VnpayCreatePaymentResponse,
    VnpayIpnResponse,
    VnpayReturnResponse,
)
from app.services.vnpay_payment import VnpayPaymentService

router = APIRouter()


@router.post("/create-payment-url", response_model=VnpayCreatePaymentResponse)
def create_vnpay_payment_url(session: SessionDep, payload: VnpayCreatePaymentRequest):
    payment_url, txn_ref = VnpayPaymentService.create_payment_url(
        session=session,
        student_tuition_fee_id=payload.student_tuition_fee_id,
        amount=payload.amount,
        order_info=payload.order_info,
        bank_code=payload.bank_code,
    )
    return VnpayCreatePaymentResponse(payment_url=payment_url, txn_ref=txn_ref)


@router.get("/ipn", response_model=VnpayIpnResponse)
def vnpay_ipn(session: SessionDep, request: Request):
    rsp_code, message = VnpayPaymentService.handle_ipn(
        session=session,
        query_params={k: v for k, v in request.query_params.items()},
    )
    return VnpayIpnResponse(RspCode=rsp_code, Message=message)


@router.get("/return", response_model=VnpayReturnResponse)
def vnpay_return(request: Request):
    success, message = VnpayPaymentService.verify_callback(
        query_params={k: v for k, v in request.query_params.items()},
    )
    return VnpayReturnResponse(success=success, message=message)
