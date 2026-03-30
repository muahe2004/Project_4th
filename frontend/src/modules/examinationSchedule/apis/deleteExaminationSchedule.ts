import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_EXAMINATION_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";

export interface ExaminationScheduleDeleteResponse {
  id: string;
  message: string;
}

const deleteExaminationSchedule = async (
  id: string
): Promise<ExaminationScheduleDeleteResponse> => {
  const response = await apiClient.delete<ExaminationScheduleDeleteResponse>(
    `${URL_API_EXAMINATION_SCHEDULE}/${id}`
  );
  return response.data;
};

type UseDeleteExaminationScheduleOptions = {
  config?: MutationConfig<typeof deleteExaminationSchedule>;
};

export const useDeleteExaminationSchedule = ({
  config,
}: UseDeleteExaminationScheduleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExaminationSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["examination-schedules"],
      });
    },
    ...config,
  });
};

