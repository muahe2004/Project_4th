import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { BASE_UNICORE_API_URL, UNICORE_PREFIX } from "../../../constants/config";

export interface ChatHistoryItem {
  role: string;
  content: string;
}

export interface PredictIntentRequest {
  text: string;
  role?: string;
  user_id?: string;
  history?: ChatHistoryItem[];
}

export interface PredictIntentResponse {
  intent: string;
  time_scope: string | null;
  confidence: number;
  index: number;
  normalized_text: string;
}

export const predictIntent = async (
  payload: PredictIntentRequest,
  token?: string
): Promise<PredictIntentResponse> => {
  const authToken = token ?? localStorage.getItem("access_token") ?? undefined;
  const response = await axios.post<PredictIntentResponse>(
    `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/ai/predict-intent`,
    payload,
    {
      withCredentials: true,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }
  );

  return response.data;
};

export const usePredictIntent = () => {
  return useMutation<
    PredictIntentResponse,
    AxiosError<{ detail?: string }>,
    { payload: PredictIntentRequest; token?: string }
  >({
    mutationFn: ({ payload, token }) => predictIntent(payload, token),
  });
};
