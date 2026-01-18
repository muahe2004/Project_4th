import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_STUTDENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IStudentCreate } from "../types";

const createStudent = async (data: IStudentCreate): Promise<any> => {
    const response = await apiClient.post(`${URL_API_STUTDENT}`, data);
    return response.data;
}

type UseCreateStudentOptions = {
    config?: MutationConfig<typeof createStudent>
}

export const useCreateStudent = ({ config }: UseCreateStudentOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createStudent,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["students"],
            })
        },
        ...config
    })
}