import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ICourses } from "../types";
import { URL_API_COURSE } from "../../../constants/config";

const createCourse = async (data: ICourses): Promise<any> => {
    const response = await apiClient.post(`${URL_API_COURSE}`, data);
    return response.data;
}

type UseCreateCourseOptions = {
    config?: MutationConfig<typeof createCourse>
}

export const useCreateCourse = ({ config }: UseCreateCourseOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCourse,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["courses"],
            })
        },
        ...config
    })
}