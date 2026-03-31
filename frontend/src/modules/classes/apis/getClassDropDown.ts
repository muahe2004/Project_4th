import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_CLASS } from '../../../constants/config';
import type { IClassesDropDown } from '../types';

export interface Params {
    limit: number;
    skip: number;
    specialization_id?: string;
    teacher_id?: string;
    class_type?: string;
    registration_status?: string;
    search?: string;
}

const getClassesDropDown = async (params: Params): Promise<IClassesDropDown[]> => {
    const res = await axios.get<IClassesDropDown[]>(
        `${URL_API_CLASS}/dropdown`,
        { params, withCredentials: true }
    );
    return res.data;
};

export const useClassesDropDown = (params: Params) => {
    return useQuery<IClassesDropDown[], AxiosError<{ detail?: string }>>({
        queryKey: ['classes-dropdown', params],
        queryFn: () => getClassesDropDown(params),
    });
};
