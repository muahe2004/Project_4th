import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_DEPARTMENT } from '../../../constants/config';
import type { IDepartmentsDropDown } from '../types';

export interface DepartmentDropDownParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
}

const getDepartmentsDropDown = async (
  params: DepartmentDropDownParams
): Promise<IDepartmentsDropDown[]> => {
  const res = await axios.get<IDepartmentsDropDown[]>(
    `${URL_API_DEPARTMENT}/dropdown`,
    {
      params,
      withCredentials: true,
    }
  );
  return res.data;
};

export const useDepartmentsDropDown = (params: DepartmentDropDownParams) => {
  return useQuery<IDepartmentsDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ['departments-dropdown', params],
    queryFn: () => getDepartmentsDropDown(params),
  });
};
