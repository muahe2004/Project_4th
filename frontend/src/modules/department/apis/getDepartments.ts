import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_DEPARTMENT } from '../../../constants/config';

// Kiểu dữ liệu của 1 department
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

// Kiểu dữ liệu trả về từ API
export interface DepartmentListResponse {
  total: number;
  items: DepartmentResponse[];
}

const getDepartments = async (): Promise<DepartmentListResponse> => {
  try {
    const res = await axios.get<DepartmentListResponse>(
      `${URL_API_DEPARTMENT}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Unexpected error');
  }
};

export const useGetDepartment = () => {
  return useQuery<DepartmentListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  });
};
