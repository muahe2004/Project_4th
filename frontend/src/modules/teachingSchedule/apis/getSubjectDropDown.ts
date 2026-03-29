import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_SUBJECT } from "../../../constants/config";
import type { ISubjectDropDown } from "../types";

export interface SubjectDropDownParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
}

const getSubjectDropDown = async (
  params: SubjectDropDownParams
): Promise<ISubjectDropDown[]> => {
  const res = await axios.get<ISubjectDropDown[]>(`${URL_API_SUBJECT}/dropdown`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

export const useSubjectDropDown = (params: SubjectDropDownParams) => {
  return useQuery<ISubjectDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ["subject-dropdown", params],
    queryFn: () => getSubjectDropDown(params),
  });
};
