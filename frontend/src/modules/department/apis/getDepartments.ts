import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_DEPARTMENT } from '../../../constants/config';
import type { IDepartments } from '../types';

export interface DepartmentListResponse {
  total: number;
  data: IDepartments[];
}

export interface Params {
  limit: number;
  skip: number;
}

const getDepartments = async (params: Params): Promise<DepartmentListResponse> => {
  try {
    const res = await axios.get<DepartmentListResponse>(
      `${URL_API_DEPARTMENT}`,
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

export const useGetDepartment = (params: Params) => {
  return useQuery<DepartmentListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ['departments', params],
    queryFn: () => getDepartments(params),
  });
};