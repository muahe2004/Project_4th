import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_MAJOR } from "../../../constants/config";
import type { MutationConfig } from "../../../lib/react-query";

export interface MajorDeleteResponse {
  id: string;
  message: string;
}

const deleteMajor = async (id: string): Promise<MajorDeleteResponse> => {
  const response = await apiClient.delete<MajorDeleteResponse>(
    `${URL_API_MAJOR}/${id}`,
  );
  return response.data;
};

export const useDeleteMajor = (
  config?: MutationConfig<typeof deleteMajor>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMajor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    ...config,
  });
};
