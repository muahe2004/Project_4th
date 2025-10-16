

import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_COURSE } from '../../../constants/config';
import type { ICourses } from '../types';

export interface IPagination {
    currentPage: number;
    page: number;
    totalItems: number;
    totalPages: number;
}

export interface CourseListResponse {
    pagination: IPagination;
    data: ICourses[];
}

export interface Params {
    page: number;
    pageSize: number;
}

const getCourses = async (params: Params): Promise<CourseListResponse> => {
    try {
        const res = await axios.get<CourseListResponse>(
            `${URL_API_COURSE}`,
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

export const useGetCourses = (params: Params) => {
    return useQuery<CourseListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ['courses', params],
        queryFn: () => getCourses(params),
    });
};