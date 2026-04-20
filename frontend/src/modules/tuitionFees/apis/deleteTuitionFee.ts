import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { URL_API_TUITION_FEE } from "../../../constants/config";

const deleteTuitionFee = async (id: string) => {
  const response = await axios.delete(`${URL_API_TUITION_FEE}/${id}`, {
    withCredentials: true,
  });

  return response.data as { message: string; id: string };
};

export const useDeleteTuitionFee = () => {
  return useMutation<{ message: string; id: string }, AxiosError<{ detail?: string }>, string>({
    mutationFn: deleteTuitionFee,
  });
};
