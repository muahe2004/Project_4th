import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { BASE_UNICORE_API_URL, UNICORE_PREFIX } from "../../../constants/config";

interface CreateVnpayPaymentPayload {
  student_tuition_fee_id: string;
  amount?: number;
  order_info?: string;
  bank_code?: string;
}

interface CreateVnpayPaymentResponse {
  payment_url: string;
  txn_ref: string;
}

const URL_API_VNPAY_CREATE_PAYMENT = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/vnpay/create-payment-url`;

const createVnpayPaymentUrl = async (
  payload: CreateVnpayPaymentPayload
): Promise<CreateVnpayPaymentResponse> => {
  const response = await apiClient.post(URL_API_VNPAY_CREATE_PAYMENT, payload);
  return response.data;
};

export const useCreateVnpayPaymentUrl = () => {
  return useMutation({ mutationFn: createVnpayPaymentUrl });
};
