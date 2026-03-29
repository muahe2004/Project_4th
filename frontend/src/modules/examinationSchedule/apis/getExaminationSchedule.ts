import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { apiClient } from "../../../lib/api";
import { URL_API_EXAMINATION_SCHEDULE } from "../../../constants/config";
import type {
  IExaminationScheduleListResponse,
  IExaminationScheduleQueryParams,
} from "../types";

const getExaminationSchedules = async (
  params: IExaminationScheduleQueryParams
): Promise<IExaminationScheduleListResponse> => {
  const response = await apiClient.get<IExaminationScheduleListResponse>(
    URL_API_EXAMINATION_SCHEDULE,
    {
      params,
    }
  );
  return response.data;
};

export const useGetExaminationSchedules = (params: IExaminationScheduleQueryParams) => {
  return useQuery<IExaminationScheduleListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["examination-schedules", params],
    queryFn: () => getExaminationSchedules(params),
  });
};
