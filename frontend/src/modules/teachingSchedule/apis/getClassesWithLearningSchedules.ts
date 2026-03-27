import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_CLASS } from "../../../constants/config";
import type { IClassWithLearningSchedulesResponse } from "../types";

export interface ClassWithLearningSchedulesParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
}

const getClassesWithLearningSchedules = async (
  params: ClassWithLearningSchedulesParams
): Promise<IClassWithLearningSchedulesResponse> => {
  const res = await axios.get<IClassWithLearningSchedulesResponse>(
    `${URL_API_CLASS}/with-learning-schedules`,
    {
      params,
      withCredentials: true,
    }
  );
  return res.data;
};

export const useGetClassesWithLearningSchedules = (
  params: ClassWithLearningSchedulesParams,
  enabled = true
) => {
  return useQuery<IClassWithLearningSchedulesResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["classes-with-learning-schedules", params],
    queryFn: () => getClassesWithLearningSchedules(params),
    enabled,
  });
};
