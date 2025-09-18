import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_DEPARTMENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { IDepartments } from "../types";

export type DepartmentEditDto = Partial<IDepartments>;

export type EditDepartmentResponse = IDepartments;

const editDepartment = async (
    id: string,
    data: DepartmentEditDto,
): Promise<EditDepartmentResponse> => {
    const response = await apiClient.patch(`${URL_API_DEPARTMENT}/${id}`, data);
    return response.data;
}

export const useEditDepartment = (
    config?: UseMutationOptions<EditDepartmentResponse, Error, {id: string; data: DepartmentEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editDepartment(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}