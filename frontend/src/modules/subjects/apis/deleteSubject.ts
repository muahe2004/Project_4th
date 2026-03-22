import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_SUBJECT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { SubjectDeleteResponse } from "../types";

const deleteSubjects = async (
  subjectIds: string[]
): Promise<SubjectDeleteResponse[]> => {
  const params = new URLSearchParams();
  subjectIds.forEach((id) => {
    params.append("subject_ids", id);
  });

  const response = await apiClient.delete<SubjectDeleteResponse[]>(
    `${URL_API_SUBJECT}`,
    { params }
  );
  return response.data;
};

type UseDeleteSubjectOptions = {
  config?: MutationConfig<typeof deleteSubjects>;
};

export const useDeleteSubject = ({ config }: UseDeleteSubjectOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubjects,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
    },
    ...config,
  });
};
