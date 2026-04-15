import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";
import type { ITrainingProgramImportPayload, ITrainingProgram } from "../types";

const importTrainingProgram = async (
  payload: ITrainingProgramImportPayload
): Promise<ITrainingProgram> => {
  const response = await apiClient.post(`${URL_API_TRAINING_PROGRAM}`, payload);
  return response.data;
};

export const useImportTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importTrainingProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["training-programs"],
      });
    },
  });
};
