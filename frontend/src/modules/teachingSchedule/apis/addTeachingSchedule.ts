import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_TEACHING_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type {
  ITeachingScheduleCreatePayload,
  ITeachingScheduleResponse,
} from "../types";

const createTeachingSchedule = async (
  data: ITeachingScheduleCreatePayload
): Promise<ITeachingScheduleResponse> => {
  const response = await apiClient.post(`${URL_API_TEACHING_SCHEDULE}`, data);
  return response.data;
};

type UseCreateTeachingScheduleOptions = {
  config?: MutationConfig<typeof createTeachingSchedule>;
};

export const useCreateTeachingSchedule = ({
  config,
}: UseCreateTeachingScheduleOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeachingSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teaching-schedules"],
      });
    },
    ...config,
  });
};
