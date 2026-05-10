import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_SCORE_COMPONENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";

export type UpdateScoreComponentPayload = {
  component_type?: string;
  weight?: number;
  description?: string | null;
  status?: string | null;
};

export type UpdateScoreComponentResponse = {
  id: string;
  component_type: string;
  weight: number;
  description?: string | null;
};

const updateScoreComponent = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateScoreComponentPayload;
}): Promise<UpdateScoreComponentResponse> => {
  const response = await apiClient.patch<UpdateScoreComponentResponse>(
    `${URL_API_SCORE_COMPONENT}/${id}`,
    payload
  );
  return response.data;
};

export const useUpdateScoreComponent = (
  config?: UseMutationOptions<
    UpdateScoreComponentResponse,
    Error,
    { id: string; payload: UpdateScoreComponentPayload }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScoreComponent,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["score-components"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
