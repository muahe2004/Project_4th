import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { URL_API_TUITION_FEE } from "../../../constants/config";
import type { ITuitionFee, TuitionFeeUpdatePayload } from "../types";

const updateTuitionFee = async ({
  id,
  data,
}: {
  id: string;
  data: TuitionFeeUpdatePayload;
}): Promise<ITuitionFee> => {
  const response = await axios.patch<ITuitionFee>(`${URL_API_TUITION_FEE}/${id}`, data, {
    withCredentials: true,
  });

  return response.data;
};

export const useUpdateTuitionFee = () => {
  return useMutation<
    ITuitionFee,
    AxiosError<{ detail?: string }>,
    { id: string; data: TuitionFeeUpdatePayload }
  >({
    mutationFn: updateTuitionFee,
  });
};
