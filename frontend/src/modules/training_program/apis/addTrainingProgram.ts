import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../../../lib/api";
import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";
import type { ITrainingProgram, ITrainingProgramCreate } from "../types";

const addTrainingProgram = async (
  data: ITrainingProgramCreate
): Promise<ITrainingProgram> => {
  const response = await apiClient.post<ITrainingProgram>(`${URL_API_TRAINING_PROGRAM}`, data);
  return response.data;
};

export const useAddTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTrainingProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-programs"] });
    },
  });
};
