import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { IQuestions } from "../../types";
import { URL_API_QUESTION } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";

export type QuestionEditDto = Partial<IQuestions>;

export type EditQuestionResponse = IQuestions;

const editQuestion = async (
    id: string,
    data: QuestionEditDto,
): Promise<EditQuestionResponse> => {
    const response = await apiClient.patch(`${URL_API_QUESTION}/${id}`, data);
    return response.data;
}

export const useEditQuestion = (
    config?: UseMutationOptions<EditQuestionResponse, Error, {id: string; data: QuestionEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editQuestion(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}