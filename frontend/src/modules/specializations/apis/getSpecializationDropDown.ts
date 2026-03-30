import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_SPECIALIZATION } from '../../../constants/config';
import type { SpecializationsDropDown } from '../types';

export interface Params {
    limit: number;
    skip: number;
    department_id?: string;
    search?: string;
}

const getSpecializationsDropDown = async (params: Params): Promise<SpecializationsDropDown[]> => {
    const res = await axios.get<SpecializationsDropDown[]>(
        `${URL_API_SPECIALIZATION}/dropdown`,
        { params, withCredentials: true }
    );
    return res.data;
};

export const useSpecializationsDropDown = (params: Params) => {
    return useQuery<SpecializationsDropDown[], AxiosError<{ detail?: string }>>({
        queryKey: ['specializations-dropdown', params],
        queryFn: () => getSpecializationsDropDown(params),
    });
};
