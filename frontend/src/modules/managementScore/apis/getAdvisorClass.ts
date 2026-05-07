import axios, { type AxiosError } from "axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { URL_API_CLASS } from "../../../constants/config";

export interface IAdvisorClassItem {
  id: string;
  class_code: string;
  class_name: string;
  teacher_name: string;
  size: number;
}

export interface IAdvisorClassListResponse {
  total: number;
  data: IAdvisorClassItem[];
}

export interface IAdvisorClassQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  teacher_id?: string;
}

const getAdvisorClasses = async (
  params: IAdvisorClassQueryParams
): Promise<IAdvisorClassListResponse> => {
  const response = await axios.get<IAdvisorClassListResponse>(URL_API_CLASS, {
    params,
    withCredentials: true,
  });

  return response.data;
};

export const useGetAdvisorClasses = (
  params: IAdvisorClassQueryParams,
  options?: Omit<
    UseQueryOptions<IAdvisorClassListResponse, AxiosError<{ detail?: string }>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<IAdvisorClassListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["advisor-classes", params],
    queryFn: () => getAdvisorClasses(params),
    ...options,
  });
};
