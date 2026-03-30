import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_TEACHER } from "../../../constants/config";
import type { ITeacherWithLearningSchedulesResponse } from "../types";

export interface TeacherWithLearningSchedulesParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

const getTeachersWithLearningSchedules = async (
  params: TeacherWithLearningSchedulesParams
): Promise<ITeacherWithLearningSchedulesResponse> => {
  const res = await axios.get<ITeacherWithLearningSchedulesResponse>(
    `${URL_API_TEACHER}/with-learning-schedules`,
    {
      params,
      withCredentials: true,
    }
  );
  return res.data;
};

export const useGetTeachersWithLearningSchedules = (
  params: TeacherWithLearningSchedulesParams,
  enabled = true
) => {
  return useQuery<ITeacherWithLearningSchedulesResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["teachers-with-learning-schedules", params],
    queryFn: () => getTeachersWithLearningSchedules(params),
    enabled,
  });
};
