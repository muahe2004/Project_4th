import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_EXAMINATION_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type {
  IExaminationScheduleCreatePayload,
  IExaminationScheduleResponse,
} from "../types";

const createExaminationSchedule = async (
  data: IExaminationScheduleCreatePayload
): Promise<IExaminationScheduleResponse> => {
  const response = await apiClient.post(URL_API_EXAMINATION_SCHEDULE, data);
  return response.data;
};

type UseCreateExaminationScheduleOptions = {
  config?: MutationConfig<typeof createExaminationSchedule>;
};

export const useCreateExaminationSchedule = ({
  config,
}: UseCreateExaminationScheduleOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExaminationSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examination-schedules"] });
    },
    ...config,
  });
};

