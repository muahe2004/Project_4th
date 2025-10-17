import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IAnswers } from "../../types";
import { URL_API_ANSWER } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";
import type { MutationConfig } from "../../../../lib/react-query";

const createAnswer = async (data: IAnswers[]): Promise<any> => {
    const response = await apiClient.post(`${URL_API_ANSWER}`, data);
    return response.data;
}

type UseCreateAnswerOptions = {
    config?: MutationConfig<typeof createAnswer>
}

export const useCreateAnswer = ({ config }: UseCreateAnswerOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAnswer,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["answers"],
            })
        },
        ...config
    })
}