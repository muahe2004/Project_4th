import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./VnpayPaymentResult.css";

const VnpayPaymentResult = () => {
  const { search } = useLocation();
  const { t } = useTranslation();

  const result = useMemo(() => {
    const params = new URLSearchParams(search);
    const responseCode = params.get("vnp_ResponseCode") ?? "";
    const transactionStatus = params.get("vnp_TransactionStatus") ?? "";

    const isSuccess = responseCode === "00" && transactionStatus === "00";

    return { isSuccess };
  }, [search]);

  return (
    <div className="vnpay-result-page">
      <div className="vnpay-result-card">
        <div className="vnpay-result-icon">
          {result.isSuccess ? <span className="vnpay-result-check" /> : "!"}
        </div>
        <h1 className="vnpay-result-title">
          {result.isSuccess
            ? t("paymentResult.successTitle")
            : t("paymentResult.failedTitle")}
        </h1>
        <p className="vnpay-result-desc">
          {result.isSuccess
            ? t("paymentResult.successDescription")
            : t("paymentResult.failedDescription")}
        </p>

        <a
          className="vnpay-result-button"
          href="http://localhost:2004/student-tuition-fees"
        >
          {t("paymentResult.backToTuition")}
        </a>
      </div>
    </div>
  );
};

export default VnpayPaymentResult;
