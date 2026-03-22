import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_SUBJECT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { ISubject, ISubjectUpdate } from "../types";

const updateSubject = async (
  id: string,
  data: ISubjectUpdate
): Promise<ISubject> => {
  const response = await apiClient.patch<ISubject>(`${URL_API_SUBJECT}/${id}`, data);
  return response.data;
};

export const useUpdateSubject = (
  config?: UseMutationOptions<ISubject, Error, { id: string; data: ISubjectUpdate }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSubject(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
