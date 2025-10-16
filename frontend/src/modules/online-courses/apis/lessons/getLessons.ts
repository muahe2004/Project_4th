

import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_LESSON } from '../../../../constants/config';
import type { ILessons } from '../../types';

export interface IPagination {
    currentPage: number;
    page: number;
    totalItems: number;
    totalPages: number;
}

export interface LessonListResponse {
    pagination: IPagination;
    data: ILessons[];
}

export interface Params {
    page: number;
    pageSize: number;
}

const getLessons = async (params: Params): Promise<LessonListResponse> => {
    try {
        const res = await axios.get<LessonListResponse>(
            `${URL_API_LESSON}`,
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

export const useGetLessons = (params: Params) => {
    return useQuery<LessonListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ['lessons', params],
        queryFn: () => getLessons(params),
    });
};