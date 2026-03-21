import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_STUTDENT } from '../../../constants/config';
import type { IStudentsResponse } from '../types';

export interface StudentListResponse {
  total: number;
  data: IStudentsResponse[];
}

export interface Params {
  limit: number;
  skip: number;
  search?: string;
  status?: string;
  class_id?: string;
}

const getStudents = async (params: Params): Promise<StudentListResponse> => {
  try {
    const res = await axios.get<StudentListResponse>(
      `${URL_API_STUTDENT}`,
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

export const useGetStudents = (params: Params) => {
  return useQuery<StudentListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ['students', params],
    queryFn: () => getStudents(params),
  });
};