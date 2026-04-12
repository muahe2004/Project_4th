import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_TEACHER } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ITeacherFileData } from "../types";

const importTeacher = async (teachers: ITeacherFileData[]): Promise<ITeacherFileData[]> => {
  const response = await apiClient.post(`${URL_API_TEACHER}/import-list`, teachers);
  return response.data;
};

type UseImportTeacherOptions = {
  config?: MutationConfig<typeof importTeacher>;
};

export const useImportTeacher = ({ config }: UseImportTeacherOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teachers"],
      });
    },
    ...config,
  });
};
