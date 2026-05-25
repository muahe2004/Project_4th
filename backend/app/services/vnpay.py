import hashlib
import hmac
from datetime import datetime
from urllib.parse import quote_plus


class VnpayService:
    @staticmethod
    def _build_hash_data(params: dict[str, str]) -> str:
        sorted_items = sorted(params.items())
        return "&".join(
            f"{quote_plus(str(k))}={quote_plus(str(v))}" for k, v in sorted_items
        )

    @staticmethod
    def _build_query_string(params: dict[str, str]) -> str:
        sorted_items = sorted(params.items())
        return "&".join(
            f"{quote_plus(str(k))}={quote_plus(str(v))}" for k, v in sorted_items
        )

    @staticmethod
    def sign(params: dict[str, str], hash_secret: str) -> str:
        hash_data = VnpayService._build_hash_data(params)
        return hmac.new(
            hash_secret.encode("utf-8"),
            hash_data.encode("utf-8"),
            hashlib.sha512,
        ).hexdigest()

    @staticmethod
    def build_payment_url(base_url: str, params: dict[str, str], hash_secret: str) -> str:
        request_params = dict(params)
        secure_hash = VnpayService.sign(params=request_params, hash_secret=hash_secret)
        query = VnpayService._build_query_string(request_params)
        return f"{base_url}?{query}&vnp_SecureHash={secure_hash}"

    @staticmethod
    def make_txn_ref(student_tuition_fee_id: str) -> str:
        ts = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"STF{student_tuition_fee_id.replace('-', '')[:12]}{ts}"[:100]
