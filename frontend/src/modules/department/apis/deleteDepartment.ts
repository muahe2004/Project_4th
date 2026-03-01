import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_DEPARTMENT } from "../../../constants/config";
import type { MutationConfig } from "../../../lib/react-query";

export interface DepartmentDeleteResponse {
  id: string;
  message: string;
}

const deleteDepartment = async (id: string): Promise<DepartmentDeleteResponse> => {
  const response = await apiClient.delete<DepartmentDeleteResponse>(
    `${URL_API_DEPARTMENT}/${id}`,
  );
  return response.data;
};

export const useDeleteDepartment = (
  config?: MutationConfig<typeof deleteDepartment>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    ...config,
  });
};
