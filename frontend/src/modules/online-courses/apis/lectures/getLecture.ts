

import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_LECTURE } from '../../../../constants/config';
import type { ILectures } from '../../types';

export interface IPagination {
    currentPage: number;
    page: number;
    totalItems: number;
    totalPages: number;
}

export interface LessonListResponse {
    pagination: IPagination;
    data: ILectures[];
}

export interface Params {
    page: number;
    pageSize: number;
}

const getLectures = async (params: Params): Promise<LessonListResponse> => {
    try {
        const res = await axios.get<LessonListResponse>(
            `${URL_API_LECTURE}`,
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

export const useGetLectures = (params: Params) => {
    return useQuery<LessonListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ['lectures', params],
        queryFn: () => getLectures(params),
    });
};