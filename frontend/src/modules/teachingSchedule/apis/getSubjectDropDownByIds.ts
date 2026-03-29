import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_SUBJECT } from "../../../constants/config";
import type { ISubjectDropDown } from "../types";

export interface SubjectDropDownByIdsParams {
  ids: string[];
}

const getSubjectDropDownByIds = async (
  params: SubjectDropDownByIdsParams
): Promise<ISubjectDropDown[]> => {
  const res = await axios.post<ISubjectDropDown[]>(
    `${URL_API_SUBJECT}/dropdown-by-ids`,
    params,
    { withCredentials: true }
  );
  return res.data;
};

export const useSubjectDropDownByIds = (
  params: SubjectDropDownByIdsParams
) => {
  return useQuery<ISubjectDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ["subject-dropdown-by-ids", params],
    queryFn: () => (params.ids.length ? getSubjectDropDownByIds(params) : Promise.resolve([])),
  });
};
