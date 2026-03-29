import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_TEACHER } from '../../../constants/config';
import type { TeacherDropDown } from '../types';

export interface TeacherDropDownByIdsParams {
  ids: string[];
}

const getTeacherDropdownByIds = async (
  params: TeacherDropDownByIdsParams
): Promise<TeacherDropDown[]> => {
  const res = await axios.post<TeacherDropDown[]>(
    `${URL_API_TEACHER}/dropdown-by-ids`,
    params,
    { withCredentials: true }
  );
  return res.data;
};

export const useTeacherDropdownByIds = (params: TeacherDropDownByIdsParams) => {
  return useQuery<TeacherDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ['teachers-dropdown-by-ids', params],
    queryFn: () => (params.ids.length ? getTeacherDropdownByIds(params) : Promise.resolve([])),
  });
};
