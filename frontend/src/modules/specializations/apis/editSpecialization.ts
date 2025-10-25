import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_SPECIALIZATION } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { ISpecializations } from "../types";

export type SpecializationEditDto = Partial<ISpecializations>;

export type EditSpecializationResponse = ISpecializations;

const editSpecialization = async (
    id: string,
    data: SpecializationEditDto,
): Promise<EditSpecializationResponse> => {
    const response = await apiClient.patch(`${URL_API_SPECIALIZATION}/${id}`, data);
    return response.data;
}

export const useEditSpecialization = (
    config?: UseMutationOptions<EditSpecializationResponse, Error, {id: string; data: SpecializationEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editSpecialization(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["specializations"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}