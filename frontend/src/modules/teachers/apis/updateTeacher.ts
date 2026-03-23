import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_TEACHER } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { ITeacherResponse, ITeacherUpdate } from "../types";

const updateTeacher = async (
  id: string,
  data: ITeacherUpdate
): Promise<ITeacherResponse> => {
  const response = await apiClient.patch<ITeacherResponse>(
    `${URL_API_TEACHER}/${id}`,
    data
  );
  return response.data;
};

export const useUpdateTeacher = (
  config?: UseMutationOptions<
    ITeacherResponse,
    Error,
    { id: string; data: ITeacherUpdate }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTeacher(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
