import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_TUITION_FEE } from "../../../constants/config";
import type { TuitionFeeListResponse, TuitionFeeQueryParams } from "../types";

const getTuitionFees = async (
  params: TuitionFeeQueryParams
): Promise<TuitionFeeListResponse> => {
  const res = await axios.get<TuitionFeeListResponse>(URL_API_TUITION_FEE, {
    params,
    withCredentials: true,
  });

  return res.data;
};

export const useGetTuitionFees = (params: TuitionFeeQueryParams) => {
  return useQuery<TuitionFeeListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["tuition-fees", params],
    queryFn: () => getTuitionFees(params),
  });
};
