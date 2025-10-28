import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_CLASS } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { IClasses } from "../types";

export type ClassEditDto = Partial<IClasses>;

export type EditClassResponse = IClasses;

const editClass = async (
    id: string,
    data: ClassEditDto,
): Promise<EditClassResponse> => {
    const response = await apiClient.patch(`${URL_API_CLASS}/${id}`, data);
    return response.data;
}

export const useEditClass = (
    config?: UseMutationOptions<EditClassResponse, Error, {id: string; data: ClassEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editClass(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}