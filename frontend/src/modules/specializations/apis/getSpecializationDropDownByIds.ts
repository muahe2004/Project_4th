import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { URL_API_SPECIALIZATION } from '../../../constants/config';
import type { SpecializationsDropDown } from '../types';

export interface SpecializationDropDownByIdsParams {
  ids: string[];
}

const getSpecializationsDropDownByIds = async (
  params: SpecializationDropDownByIdsParams
): Promise<SpecializationsDropDown[]> => {
  const res = await axios.post<SpecializationsDropDown[]>(
    `${URL_API_SPECIALIZATION}/dropdown-by-ids`,
    params,
    { withCredentials: true }
  );
  return res.data;
};

export const useSpecializationsDropDownByIds = (
  params: SpecializationDropDownByIdsParams
) => {
  return useQuery<SpecializationsDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ['specializations-dropdown-by-ids', params],
    queryFn: () => (params.ids.length ? getSpecializationsDropDownByIds(params) : Promise.resolve([])),
  });
};
