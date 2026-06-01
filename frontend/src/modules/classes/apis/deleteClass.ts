import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_CLASS } from "../../../constants/config";
import { apiClient } from "../../../lib/api";

export interface DeleteClassResponse {
    id: string;
    message: string;
}

const deleteClass = async (id: string): Promise<DeleteClassResponse> => {
    const response = await apiClient.delete<DeleteClassResponse>(`${URL_API_CLASS}/${id}`);
    return response.data;
};

type UseDeleteClassOptions = {
    config?: UseMutationOptions<DeleteClassResponse, Error, string>;
};

export const useDeleteClass = ({ config }: UseDeleteClassOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteClass,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            queryClient.invalidateQueries({ queryKey: ["classes-dropdown"] });
            queryClient.invalidateQueries({ queryKey: ["classes-with-learning-schedules"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
};
