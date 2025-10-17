

import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_QUESTION } from '../../../../constants/config';
import type { QuestionListResponse } from '../../types';

export interface Params {
    page: number;
    pageSize: number;
}

const getQuestion = async (params: Params): Promise<QuestionListResponse> => {
    try {
        const res = await axios.get<QuestionListResponse>(
            `${URL_API_QUESTION}`,
            {
                params, 
                withCredentials: true,
            }
        );
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Unexpected error');
    }
};

export const useGetQuestion = (params: Params) => {
    return useQuery<QuestionListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ['questions', params],
        queryFn: () => getQuestion(params),
    });
};