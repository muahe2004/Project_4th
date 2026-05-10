import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_SCORE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { StudentScoreItemResponse } from "../../grades/types";

export type FillComponentScoreItem = {
  id: string;
  score_component_id?: string;
  score?: number | null;
  score_type?: string | null;
  status?: string | null;
};

export type FillComponentScorePayload = {
  scores: FillComponentScoreItem[];
};

export type FillComponentScoreResponse = {
  items: StudentScoreItemResponse[];
  total: number;
};

const fillComponentScore = async (
  payload: FillComponentScorePayload
): Promise<FillComponentScoreResponse> => {
  const response = await apiClient.patch<FillComponentScoreResponse>(`${URL_API_SCORE}/bulk`, payload);
  return response.data;
};

export const useFillComponentScore = (
  config?: UseMutationOptions<FillComponentScoreResponse, Error, FillComponentScorePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fillComponentScore,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
