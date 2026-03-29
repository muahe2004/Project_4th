import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_MAJOR } from '../../../constants/config';
import type { IMajorsDropDown } from '../types';

export interface MajorDropDownByIdsParams {
  ids: string[];
}

const getMajorsDropDownByIds = async (
  params: MajorDropDownByIdsParams
): Promise<IMajorsDropDown[]> => {
  const res = await axios.post<IMajorsDropDown[]>(
    `${URL_API_MAJOR}/dropdown-by-ids`,
    params,
    { withCredentials: true }
  );
  return res.data;
};

export const useMajorsDropDownByIds = (params: MajorDropDownByIdsParams) => {
  return useQuery<IMajorsDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ['majors-dropdown-by-ids', params],
    queryFn: () => (params.ids.length ? getMajorsDropDownByIds(params) : Promise.resolve([])),
  });
};
