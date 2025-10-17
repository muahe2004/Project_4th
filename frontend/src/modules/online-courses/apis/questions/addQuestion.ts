import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IQuestions } from "../../types";
import { URL_API_QUESTION } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";
import type { MutationConfig } from "../../../../lib/react-query";

const createQuestion = async (data: IQuestions): Promise<any> => {
    const response = await apiClient.post(`${URL_API_QUESTION}`, data);
    return response.data;
}

type UseCreateQuestionOptions = {
    config?: MutationConfig<typeof createQuestion>
}

export const useCreateQuestion = ({ config }: UseCreateQuestionOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createQuestion,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["questions"],
            })
        },
        ...config
    })
}