import axios, { type AxiosError } from "axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { URL_API_CLASS } from "../../../constants/config";

export interface ITeachingClassItem {
  id: string;
  class_code: string;
  class_name: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
}

export interface ITeachingClassListResponse {
  total: number;
  data: ITeachingClassItem[];
}

export interface ITeachingClassQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  teacher_id?: string;
  academic_term_id?: string;
}

const getTeachingClasses = async (
  params: ITeachingClassQueryParams
): Promise<ITeachingClassListResponse> => {
  const response = await axios.get<ITeachingClassListResponse>(`${URL_API_CLASS}/teaching`, {
    params,
    withCredentials: true,
  });

  return response.data;
};

export const useGetTeachingClasses = (
  params: ITeachingClassQueryParams,
  options?: Omit<
    UseQueryOptions<ITeachingClassListResponse, AxiosError<{ detail?: string }>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ITeachingClassListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["teaching-classes", params],
    queryFn: () => getTeachingClasses(params),
    ...options,
  });
};
