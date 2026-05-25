from uuid import UUID

from sqlmodel import SQLModel


class VnpayCreatePaymentRequest(SQLModel):
    student_tuition_fee_id: UUID
    amount: float | None = None
    order_info: str = "Thanh toan hoc phi"
    bank_code: str | None = None


class VnpayCreatePaymentResponse(SQLModel):
    payment_url: str
    txn_ref: str


class VnpayIpnResponse(SQLModel):
    RspCode: str
    Message: str
