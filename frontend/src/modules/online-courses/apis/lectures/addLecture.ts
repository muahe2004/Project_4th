import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ILectures } from "../../types";
import { URL_API_LECTURE } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";
import type { MutationConfig } from "../../../../lib/react-query";

const createLecture = async (data: ILectures): Promise<any> => {
    const response = await apiClient.post(`${URL_API_LECTURE}`, data);
    return response.data;
}

type UseCreateLectureOptions = {
    config?: MutationConfig<typeof createLecture>
}

export const useCreateLecture = ({ config }: UseCreateLectureOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLecture,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["lectures"],
            })
        },
        ...config
    })
}