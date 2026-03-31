import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_CLASS } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IClasses } from "../types";

const createClass = async (data: IClasses): Promise<any> => {
    const response = await apiClient.post(`${URL_API_CLASS}`, data);
    return response.data;
}

type UseCreateClassOptions = {
    config?: MutationConfig<typeof createClass>
}

export const useCreateClass = ({ config }: UseCreateClassOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createClass,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["classes"],
            });
            queryClient.invalidateQueries({
                queryKey: ["classes-dropdown"],
            });
            queryClient.invalidateQueries({
                queryKey: ["classes-with-learning-schedules"],
            });
        },
        ...config
    })
}
