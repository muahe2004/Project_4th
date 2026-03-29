import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_DEPARTMENT } from '../../../constants/config';
import type { IDepartmentsDropDown } from '../types';

export interface DepartmentDropDownByIdsParams {
  ids: string[];
}

const getDepartmentsDropDownByIds = async (
  params: DepartmentDropDownByIdsParams
): Promise<IDepartmentsDropDown[]> => {
  const res = await axios.post<IDepartmentsDropDown[]>(
    `${URL_API_DEPARTMENT}/dropdown-by-ids`,
    params,
    { withCredentials: true }
  );
  return res.data;
};

export const useDepartmentsDropDownByIds = (params: DepartmentDropDownByIdsParams) => {
  return useQuery<IDepartmentsDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ['departments-dropdown-by-ids', params],
    queryFn: () => (params.ids.length ? getDepartmentsDropDownByIds(params) : Promise.resolve([])),
  });
};
