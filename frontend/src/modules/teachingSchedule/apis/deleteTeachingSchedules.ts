import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_TEACHING_SCHEDULE } from "../../../constants/config";
import type { MutationConfig } from "../../../lib/react-query";

export interface TeachingScheduleDeleteResponse {
  id: string;
  message: string;
}

const deleteTeachingSchedule = async (
  id: string
): Promise<TeachingScheduleDeleteResponse> => {
  const response = await apiClient.delete<TeachingScheduleDeleteResponse>(
    `${URL_API_TEACHING_SCHEDULE}/${id}`
  );
  return response.data;
};

export const useDeleteTeachingSchedule = (
  config?: MutationConfig<typeof deleteTeachingSchedule>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeachingSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teaching-schedules"] });
    },
    ...config,
  });
};
