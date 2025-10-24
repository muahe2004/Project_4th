import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_MAJOR } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { IMajors } from "../types";

export type MajorEditDto = Partial<IMajors>;

export type EditMajorResponse = IMajors;

const editMajor = async (
    id: string,
    data: MajorEditDto,
): Promise<EditMajorResponse> => {
    const response = await apiClient.patch(`${URL_API_MAJOR}/${id}`, data);
    return response.data;
}

export const useEditMajor = (
    config?: UseMutationOptions<EditMajorResponse, Error, {id: string; data: MajorEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editMajor(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["majors"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}