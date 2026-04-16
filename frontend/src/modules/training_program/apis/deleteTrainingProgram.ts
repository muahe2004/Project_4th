import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";

export interface ITrainingProgramDeleteResponse {
  message: string;
  id: string;
}

const deleteTrainingProgram = async (id: string): Promise<ITrainingProgramDeleteResponse> => {
  const response = await apiClient.delete<ITrainingProgramDeleteResponse>(`${URL_API_TRAINING_PROGRAM}/${id}`);
  return response.data;
};

export const useDeleteTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrainingProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-programs"] });
    },
  });
};
