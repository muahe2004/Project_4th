import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_TEACHER } from '../../../constants/config';
import type { TeacherDropDown } from '../types';

export interface Params {
    limit: number;
    skip: number;
    department_id?: string;
}

const getTeacherDropdown = async (params: Params): Promise<TeacherDropDown[]> => {
    const res = await axios.get<TeacherDropDown[]>(
        `${URL_API_TEACHER}/dropdown`,
        { params, withCredentials: true }
    );
    return res.data;
};

export const useTeacherDropdown = (params: Params) => {
    return useQuery<TeacherDropDown[], AxiosError<{ detail?: string }>>({
        queryKey: ['teachers', params],
        queryFn: () => getTeacherDropdown(params),
    });
};