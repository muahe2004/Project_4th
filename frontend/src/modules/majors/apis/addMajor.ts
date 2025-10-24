import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_MAJOR } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IMajors } from "../types";

const createMajor = async (data: IMajors): Promise<any> => {
    const response = await apiClient.post(`${URL_API_MAJOR}`, data);
    return response.data;
}

type UseCreateMajorOptions = {
    config?: MutationConfig<typeof createMajor>
}

export const useCreateMajor = ({ config }: UseCreateMajorOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createMajor,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["majors"],
            })
        },
        ...config
    })
}