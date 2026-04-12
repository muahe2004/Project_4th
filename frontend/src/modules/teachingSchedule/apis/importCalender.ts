import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_TEACHING_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type {
  IImportTeachingCalenderPayload,
  IImportTeachingCalenderResponse,
} from "../types";

const importCalender = async (
  payload: IImportTeachingCalenderPayload
): Promise<IImportTeachingCalenderResponse> => {
  const response = await apiClient.post(
    `${URL_API_TEACHING_SCHEDULE}/import-calender`,
    payload
  );
  return response.data;
};

type UseImportCalenderOptions = {
  config?: MutationConfig<typeof importCalender>;
};

export const useImportCalender = ({ config }: UseImportCalenderOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importCalender,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teaching-schedules"],
      });
    },
    ...config,
  });
};
