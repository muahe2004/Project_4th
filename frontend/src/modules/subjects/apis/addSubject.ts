import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_SUBJECT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ISubject, ISubjectCreate } from "../types";

const createSubject = async (data: ISubjectCreate): Promise<ISubject> => {
  const response = await apiClient.post<ISubject>(`${URL_API_SUBJECT}`, data);
  return response.data;
};

type UseCreateSubjectOptions = {
  config?: MutationConfig<typeof createSubject>;
};

export const useCreateSubject = ({ config }: UseCreateSubjectOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
    },
    ...config,
  });
};
