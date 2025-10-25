import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_SPECIALIZATION } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ISpecializations } from "../types";

const createSpecialization = async (data: ISpecializations): Promise<any> => {
    const response = await apiClient.post(`${URL_API_SPECIALIZATION}`, data);
    return response.data;
}

type UseCreateSpecializationOptions = {
    config?: MutationConfig<typeof createSpecialization>
}

export const useCreateSpecialization = ({ config }: UseCreateSpecializationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSpecialization,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["specializations"],
            })
        },
        ...config
    })
}