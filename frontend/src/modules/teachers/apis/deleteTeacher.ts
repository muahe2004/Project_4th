import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_TEACHER } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { TeacherDeleteResponse } from "../types";

const deleteTeachers = async (
  teacherIds: string[]
): Promise<TeacherDeleteResponse[]> => {
  const response = await apiClient.delete<TeacherDeleteResponse[]>(
    `${URL_API_TEACHER}`,
    { data: teacherIds }
  );

  return response.data;
};

type UseDeleteTeacherOptions = {
  config?: MutationConfig<typeof deleteTeachers>;
};

export const useDeleteTeacher = ({ config }: UseDeleteTeacherOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeachers,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teachers"],
      });
    },
    ...config,
  });
};
