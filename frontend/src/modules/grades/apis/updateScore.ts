import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_SCORE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { StudentScoreItemResponse } from "../types";

export type ScoreUpdatePayload = {
  score: number;
};

const updateScore = async (
  id: string,
  data: ScoreUpdatePayload
): Promise<StudentScoreItemResponse> => {
  const response = await apiClient.patch<StudentScoreItemResponse>(
    `${URL_API_SCORE}/${id}`,
    data
  );
  return response.data;
};

export const useUpdateScore = (
  config?: UseMutationOptions<
    StudentScoreItemResponse,
    Error,
    { id: string; data: ScoreUpdatePayload }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateScore(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
