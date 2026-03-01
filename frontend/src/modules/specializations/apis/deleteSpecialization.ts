import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_SPECIALIZATION } from "../../../constants/config";
import type { MutationConfig } from "../../../lib/react-query";

export interface SpecializationDeleteResponse {
  id: string;
  message: string;
}

const deleteSpecialization = async (id: string): Promise<SpecializationDeleteResponse> => {
  const response = await apiClient.delete<SpecializationDeleteResponse>(
    `${URL_API_SPECIALIZATION}/${id}`,
  );
  return response.data;
};

export const useDeleteSpecialization = (
  config?: MutationConfig<typeof deleteSpecialization>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpecialization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    ...config,
  });
};
