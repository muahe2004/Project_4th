import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_MAJOR } from '../../../constants/config';
import type { IMajors } from '../types';

export interface MajorListResponse {
  total: number;
  data: IMajors[];
}

export interface Params {
  limit: number;
  skip: number;
  department_id?: string;
}

const getMajors = async (params: Params): Promise<MajorListResponse> => {
  try {
    const res = await axios.get<MajorListResponse>(
      `${URL_API_MAJOR}`,
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

export const useGetMajor = (params: Params) => {
  return useQuery<MajorListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ['majors', params],
    queryFn: () => getMajors(params),
  });
};