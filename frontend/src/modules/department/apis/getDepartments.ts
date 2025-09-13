import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_DEPARTMENT } from '../../../constants/config';

export interface DepartmentResponse {
  id: string;
  department_code: string;
  name: string;
  description: string;
  established_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentListResponse {
  total: number;
  data: DepartmentResponse[];
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