import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_SCORE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { StudentScoreItemResponse } from "../../grades/types";

export type ScoreCreatePayload = {
  student_id: string;
  subject_id: string;
  academic_term_id: string;
  score_component_id: string;
  score: number;
  attempt?: number;
  score_type?: string;
  status?: string | null;
};

const addScore = async (data: ScoreCreatePayload): Promise<StudentScoreItemResponse> => {
  const response = await apiClient.post<StudentScoreItemResponse>(URL_API_SCORE, data);
  return response.data;
};

export const useAddScore = (
  config?: UseMutationOptions<StudentScoreItemResponse, Error, ScoreCreatePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addScore,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
