import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_TEACHING_SCHEDULE } from "../../../constants/config";
import type { ITeachingScheduleResponse } from "../types";

export interface TeachingScheduleListResponse {
  total: number;
  data: ITeachingScheduleResponse[];
}

export interface Params {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
}

const getTeachingSchedules = async (
  params: Params
): Promise<TeachingScheduleListResponse> => {
  try {
    const res = await axios.get<TeachingScheduleListResponse>(
      `${URL_API_TEACHING_SCHEDULE}`,
      {
        params,
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Unexpected error");
  }
};

export const useGetTeachingSchedules = (params: Params) => {
  return useQuery<TeachingScheduleListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["teaching-schedules", params],
    queryFn: () => getTeachingSchedules(params),
  });
};
