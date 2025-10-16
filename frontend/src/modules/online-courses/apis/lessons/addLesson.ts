import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ILessons } from "../../types";
import { URL_API_LESSON } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";
import type { MutationConfig } from "../../../../lib/react-query";

const createLesson = async (data: ILessons): Promise<any> => {
    const response = await apiClient.post(`${URL_API_LESSON}`, data);
    return response.data;
}

type UseCreateLessonOptions = {
    config?: MutationConfig<typeof createLesson>
}

export const useCreateLesson = ({ config }: UseCreateLessonOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLesson,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["lessons"],
            })
        },
        ...config
    })
}