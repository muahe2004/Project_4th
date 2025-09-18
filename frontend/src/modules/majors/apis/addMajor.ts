import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_DEPARTMENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IDepartments } from "../types";

const createDepartment = async (data: IDepartments): Promise<any> => {
    const response = await apiClient.post(`${URL_API_DEPARTMENT}`, data);
    return response.data;
}

type UseCreateDepartmentOptions = {
    config?: MutationConfig<typeof createDepartment>
}

export const useCreateDepartment = ({ config }: UseCreateDepartmentOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createDepartment,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["departments"],
            })
        },
        ...config
    })
}