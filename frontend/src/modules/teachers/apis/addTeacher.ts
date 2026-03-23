import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_TEACHER } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ITeacherCreate, ITeacherResponse } from "../types";

const createTeacher = async (data: ITeacherCreate): Promise<ITeacherResponse> => {
  const response = await apiClient.post<ITeacherResponse>(`${URL_API_TEACHER}`, data);
  return response.data;
};

type UseCreateTeacherOptions = {
  config?: MutationConfig<typeof createTeacher>;
};

export const useCreateTeacher = ({ config }: UseCreateTeacherOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teachers"],
      });
    },
    ...config,
  });
};
