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
  score: number | null;
  attempt?: number;
  score_type?: string;
  status?: string | null;
};

export type ScoreBulkCreatePayload = {
  scores: ScoreCreatePayload[];
};

export type ScoreBulkCreateResponse = {
  items: StudentScoreItemResponse[];
  total: number;
};

const addScoreList = async (payload: ScoreBulkCreatePayload): Promise<ScoreBulkCreateResponse> => {
  const response = await apiClient.post<ScoreBulkCreateResponse>(`${URL_API_SCORE}/bulk`, payload);
  return response.data;
};

export const useAddScoreList = (
  config?: UseMutationOptions<ScoreBulkCreateResponse, Error, ScoreBulkCreatePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addScoreList,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
