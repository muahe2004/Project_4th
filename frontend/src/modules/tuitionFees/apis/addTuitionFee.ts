import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { URL_API_TUITION_FEE } from "../../../constants/config";
import type { ITuitionFee, TuitionFeeCreatePayload } from "../types";

const addTuitionFee = async (data: TuitionFeeCreatePayload): Promise<ITuitionFee> => {
  const response = await axios.post<ITuitionFee[]>(URL_API_TUITION_FEE, [data], {
    withCredentials: true,
  });

  return response.data[0];
};

export const useCreateTuitionFee = () => {
  return useMutation<ITuitionFee, AxiosError<{ detail?: string }>, TuitionFeeCreatePayload>({
    mutationFn: addTuitionFee,
  });
};
