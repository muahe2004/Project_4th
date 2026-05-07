import { useMutation } from "@tanstack/react-query";
import { URL_API_SCORE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import { queryClient } from "../../../lib/react-query";
import type { MutationConfig } from "../../../lib/react-query";

export type ImportScoreItem = {
  score_1?: number | null;
  score_2?: number | null;
  score_exam?: number | null;
  student_id?: string | null;
  student_code?: string | null;
  class_code?: string | null;
};

export type ImportScoreListPayload = {
  academic_term_id: string;
  subject_id: string;
  attempt: number;
  scores: ImportScoreItem[];
};

const importScoreList = async (payload: ImportScoreListPayload) => {
  const response = await apiClient.post(`${URL_API_SCORE}/import-list`, payload);
  return response.data;
};

type UseImportScoreListOptions = {
  config?: MutationConfig<typeof importScoreList>;
};

export const useImportScoreList = ({ config }: UseImportScoreListOptions = {}) => {
  const { onSuccess, ...restConfig } = config ?? {};

  return useMutation({
    mutationFn: importScoreList,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["scores"] });
      await queryClient.refetchQueries({ queryKey: ["scores"] });
      await onSuccess?.(...args);
    },
    ...restConfig,
  });
};
