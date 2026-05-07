import axios, { type AxiosError } from "axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { URL_API_SCORE } from "../../../constants/config";
import type { IScoreByClassSubjectResponse } from "../types";

export interface IScoreByClassSubjectParams {
  class_id: string;
  subject_id: string;
}

const getScoreByClassSubject = async (
  params: IScoreByClassSubjectParams
): Promise<IScoreByClassSubjectResponse> => {
  const response = await axios.get<IScoreByClassSubjectResponse>(`${URL_API_SCORE}/class-subject`, {
    params,
    withCredentials: true,
  });

  return response.data;
};

export const useGetScoreByClassSubject = (
  params?: IScoreByClassSubjectParams,
  options?: Omit<
    UseQueryOptions<IScoreByClassSubjectResponse, AxiosError<{ detail?: string }>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<IScoreByClassSubjectResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["scores", "class-subject", params],
    queryFn: () => getScoreByClassSubject(params as IScoreByClassSubjectParams),
    ...options,
  });
};
