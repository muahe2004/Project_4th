import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_EXAMINATION_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type {
  IImportExaminationSchedulePayload,
  IImportExaminationScheduleResponse,
} from "../types";

const importExaminationSchedule = async (
  payload: IImportExaminationSchedulePayload
): Promise<IImportExaminationScheduleResponse> => {
  const response = await apiClient.post(
    `${URL_API_EXAMINATION_SCHEDULE}/import-file`,
    payload
  );
  return response.data;
};

type UseImportExaminationScheduleOptions = {
  config?: MutationConfig<typeof importExaminationSchedule>;
};

export const useImportExaminationSchedule = ({
  config,
}: UseImportExaminationScheduleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importExaminationSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["examination-schedules"],
      });
    },
    ...config,
  });
};
