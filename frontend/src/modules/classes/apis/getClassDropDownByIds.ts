import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_CLASS } from '../../../constants/config';
import type { IClassesDropDown } from '../types';

export interface ClassDropDownByIdsParams {
  ids: string[];
}

const getClassesDropDownByIds = async (
  params: ClassDropDownByIdsParams
): Promise<IClassesDropDown[]> => {
  const res = await axios.post<IClassesDropDown[]>(
    `${URL_API_CLASS}/dropdown-by-ids`,
    params,
    { withCredentials: true }
  );
  return res.data;
};

export const useClassesDropDownByIds = (params: ClassDropDownByIdsParams) => {
  return useQuery<IClassesDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ['classes-dropdown-by-ids', params],
    queryFn: () => (params.ids.length ? getClassesDropDownByIds(params) : Promise.resolve([])),
  });
};
