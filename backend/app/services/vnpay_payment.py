import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session
from starlette import status

from app.core.config import settings
from app.models.models import StudentTuitionFees
from app.services.student_tuition_fees import StudentTuitionFeeServices
from app.services.vnpay import VnpayService


class VnpayPaymentService:
    @staticmethod
    def create_payment_url(*, session: Session, student_tuition_fee_id: uuid.UUID, amount: float | None = None, order_info: str = "Thanh toan hoc phi", bank_code: str | None = None) -> tuple[str, str]:
        if not settings.VNPAY_TMN_CODE or not settings.VNPAY_HASH_SECRET:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="VNPAY config is missing")

        record = session.get(StudentTuitionFees, student_tuition_fee_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student tuition fee does not exist")

        pay_amount = amount if amount is not None else (record.debt_amount or 0)
        if pay_amount <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be greater than 0")

        txn_ref = VnpayService.make_txn_ref(str(student_tuition_fee_id))
        create_date = datetime.now().strftime("%Y%m%d%H%M%S")
        normalized_order_info = f"STF:{student_tuition_fee_id}|{order_info}"[:255]

        params: dict[str, str] = {
            "vnp_Version": settings.VNPAY_VERSION,
            "vnp_Command": settings.VNPAY_COMMAND,
            "vnp_TmnCode": settings.VNPAY_TMN_CODE,
            "vnp_Amount": str(int(pay_amount * 100)),
            "vnp_CurrCode": settings.VNPAY_CURRENCY_CODE,
            "vnp_TxnRef": txn_ref,
            "vnp_OrderInfo": normalized_order_info,
            "vnp_OrderType": "other",
            "vnp_Locale": settings.VNPAY_LOCALE,
            "vnp_ReturnUrl": settings.VNPAY_RETURN_URL,
            "vnp_IpAddr": "127.0.0.1",
            "vnp_CreateDate": create_date,
        }
        if bank_code:
            params["vnp_BankCode"] = bank_code

        payment_url = VnpayService.build_payment_url(
            base_url=settings.VNPAY_PAYMENT_URL,
            params=params,
            hash_secret=settings.VNPAY_HASH_SECRET,
        )
        return payment_url, txn_ref

    @staticmethod
    def verify_callback(*, query_params: dict[str, str]) -> tuple[bool, str]:
        secure_hash = query_params.get("vnp_SecureHash")
        if not secure_hash or not settings.VNPAY_HASH_SECRET:
            return False, "Invalid signature"

        payload = {k: v for k, v in query_params.items() if k not in {"vnp_SecureHash", "vnp_SecureHashType"}}
        expected = VnpayService.sign(params=payload, hash_secret=settings.VNPAY_HASH_SECRET)
        if expected.lower() != secure_hash.lower():
            return False, "Invalid signature"

        return query_params.get("vnp_ResponseCode") == "00" and query_params.get("vnp_TransactionStatus") == "00", "Confirm Success"

    @staticmethod
    def handle_ipn(*, session: Session, query_params: dict[str, str]) -> tuple[str, str]:
        is_valid, message = VnpayPaymentService.verify_callback(query_params=query_params)
        if not is_valid and message == "Invalid signature":
            return "97", "Invalid signature"

        if query_params.get("vnp_ResponseCode") != "00":
            return "00", "Confirm Success"

        order_info = query_params.get("vnp_OrderInfo", "")
        if not order_info.startswith("STF:"):
            return "01", "Order not found"

        stf_id = order_info.split("|", 1)[0].replace("STF:", "")
        try:
            student_tuition_fee_id = uuid.UUID(stf_id)
        except ValueError:
            return "01", "Order not found"

        record = session.get(StudentTuitionFees, student_tuition_fee_id)
        if not record:
            return "01", "Order not found"

        paid_vnp = float(query_params.get("vnp_Amount", "0")) / 100
        StudentTuitionFeeServices.apply_successful_payment(
            session=session,
            student_tuition_fee=record,
            paid_amount=paid_vnp,
        )

        return "00", "Confirm Success"
