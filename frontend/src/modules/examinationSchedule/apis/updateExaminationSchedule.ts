import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_EXAMINATION_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type {
  IExaminationScheduleResponse,
  IExaminationScheduleUpdatePayload,
} from "../types";

const updateExaminationSchedule = async (
  id: string,
  data: IExaminationScheduleUpdatePayload
): Promise<IExaminationScheduleResponse> => {
  const response = await apiClient.patch(`${URL_API_EXAMINATION_SCHEDULE}/${id}`, data);
  return response.data;
};

export const useUpdateExaminationSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: IExaminationScheduleUpdatePayload;
    }) => updateExaminationSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examination-schedules"] });
    },
  });
};

