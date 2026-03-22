import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_SUBJECT } from "../../../constants/config";
import type { SubjectListResponse, SubjectQueryParams } from "../types";

const getSubjects = async (
  params: SubjectQueryParams
): Promise<SubjectListResponse> => {
  const res = await axios.get<SubjectListResponse>(`${URL_API_SUBJECT}`, {
    params,
    withCredentials: true,
  });

  return res.data;
};

export const useGetSubjects = (params: SubjectQueryParams) => {
  return useQuery<SubjectListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["subjects", params],
    queryFn: () => getSubjects(params),
  });
};
