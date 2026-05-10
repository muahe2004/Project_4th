import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_SCORE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { StudentScoreItemResponse } from "../../grades/types";

export type ScoreStatusBulkUpdateItem = {
  id: string;
};

export type ScoreStatusBulkUpdatePayload = {
  scores: ScoreStatusBulkUpdateItem[];
};

export type ScoreStatusBulkUpdateResponse = {
  items: StudentScoreItemResponse[];
  total: number;
};

const updateScoreStatusBulk = async (
  payload: ScoreStatusBulkUpdatePayload
): Promise<ScoreStatusBulkUpdateResponse> => {
  const response = await apiClient.patch<ScoreStatusBulkUpdateResponse>(`${URL_API_SCORE}/bulk/status`, payload);
  return response.data;
};

export const useUpdateScoreStatusBulk = (
  config?: UseMutationOptions<ScoreStatusBulkUpdateResponse, Error, ScoreStatusBulkUpdatePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScoreStatusBulk,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
