import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { URL_API_TEACHING_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type {
  ITeachingScheduleResponse,
  ITeachingScheduleUpdatePayload,
} from "../types";

const updateTeachingSchedule = async (
  id: string,
  data: ITeachingScheduleUpdatePayload
): Promise<ITeachingScheduleResponse> => {
  const response = await apiClient.patch(`${URL_API_TEACHING_SCHEDULE}/${id}`, data);
  return response.data;
};

export const useUpdateTeachingSchedule = (
  config?: UseMutationOptions<
    ITeachingScheduleResponse,
    Error,
    { id: string; data: ITeachingScheduleUpdatePayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTeachingSchedule(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["teaching-schedules"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
