import axios, {AxiosError} from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_CLASS } from "../../../constants/config";
import type { IClassesResponse } from "../types/index";

export interface ClassListResponse {
  total: number;
  data: IClassesResponse[];
}

export interface Params {
  skip: number;
  limit: number;
  specialization_id?: string;
}

const getClasss = async (params: Params): Promise<ClassListResponse> => {
  try {
    const res = await axios.get<ClassListResponse>(
      `${URL_API_CLASS}`,
      {
        params, 
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Unexpected error');
  }
};

export const useGetClasses = (params: Params) => {
  return useQuery<ClassListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ['classes', params],
    queryFn: () => getClasss(params),
  });
};