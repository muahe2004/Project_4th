import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { IAnswers } from "../../types";
import { URL_API_ANSWER } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";

export type AnswerEditDto = Partial<IAnswers>;

export type EditAnswerResponse = IAnswers;

const editAnswer = async (
    id: string,
    data: AnswerEditDto,
): Promise<EditAnswerResponse> => {
    const response = await apiClient.patch(`${URL_API_ANSWER}/${id}`, data);
    return response.data;
}

export const useEditAnswer = (
    config?: UseMutationOptions<EditAnswerResponse, Error, {id: string; data: AnswerEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editAnswer(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["answers"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}