import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_SPECIALIZATION } from '../../../constants/config';
import type { ISpecializations } from '../types';

export interface SpecializationListResponse {
  total: number;
  data: ISpecializations[];
}

export interface Params {
  limit: number;
  skip: number;
  major_id?: string;
}

const getSpecializations = async (params: Params): Promise<SpecializationListResponse> => {
  try {
    const res = await axios.get<SpecializationListResponse>(
      `${URL_API_SPECIALIZATION}`,
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

export const useGetSpecialization = (params: Params) => {
  return useQuery<SpecializationListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ['specializations', params],
    queryFn: () => getSpecializations(params),
  });
};