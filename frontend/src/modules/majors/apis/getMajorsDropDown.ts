import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_MAJOR } from '../../../constants/config';
import type { IMajorsDropDown } from '../types';

export interface MajorDropDownParams {
  limit: number;
  skip: number;
  department_id?: string;
  status?: string;
  search?: string;
}

const getMajorsDropDown = async (
  params: MajorDropDownParams
): Promise<IMajorsDropDown[]> => {
  const res = await axios.get<IMajorsDropDown[]>(
    `${URL_API_MAJOR}/dropdown`,
    {
      params,
      withCredentials: true,
    }
  );
  return res.data;
};

export const useMajorsDropDown = (params: MajorDropDownParams) => {
  return useQuery<IMajorsDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ['majors-dropdown', params],
    queryFn: () => getMajorsDropDown(params),
  });
};
