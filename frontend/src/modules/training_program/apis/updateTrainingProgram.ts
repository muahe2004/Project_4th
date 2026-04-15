import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";
import type { ITrainingProgram, ITrainingProgramUpdate } from "../types";

const updateTrainingProgram = async (
  id: string,
  data: ITrainingProgramUpdate
): Promise<ITrainingProgram> => {
  const response = await apiClient.patch<ITrainingProgram>(`${URL_API_TRAINING_PROGRAM}/${id}`, data);
  return response.data;
};

export const useUpdateTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ITrainingProgramUpdate }) =>
      updateTrainingProgram(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-programs"] });
    },
  });
};
