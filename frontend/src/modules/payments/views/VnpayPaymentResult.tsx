import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../../lib/api";
import { UNICORE_PREFIX } from "../../../constants/config";
import "./VnpayPaymentResult.css";

const VnpayPaymentResult = () => {
  const { search } = useLocation();
  const { t } = useTranslation();
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const responseCode = params.get("vnp_ResponseCode") ?? "";
    const transactionStatus = params.get("vnp_TransactionStatus") ?? "";

    if (!(responseCode === "00" && transactionStatus === "00")) {
      setIsVerifiedSuccess(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await apiClient.get(
          `/${UNICORE_PREFIX}/vnpay/return?${params.toString()}`
        );
        setIsVerifiedSuccess(Boolean(response?.data?.success));
      } catch {
        setIsVerifiedSuccess(false);
      }
    };

    verifyPayment();
  }, [search]);

  return (
    <div className="vnpay-result-page">
      <div className="vnpay-result-card">
        <div className="vnpay-result-icon">
          {isVerifiedSuccess ? <span className="vnpay-result-check" /> : "!"}
        </div>
        <h1 className="vnpay-result-title">
          {isVerifiedSuccess
            ? t("paymentResult.successTitle")
            : t("paymentResult.failedTitle")}
        </h1>
        <p className="vnpay-result-desc">
          {isVerifiedSuccess
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
