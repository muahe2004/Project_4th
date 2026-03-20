import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_SUBJECT } from "../../../constants/config";
import type { ISubjectDropDown } from "../types";

export interface SubjectDropDownListResponse {
  total: number;
  data: ISubjectDropDown[];
}

export interface SubjectDropDownParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
}

const getSubjectDropDown = async (
  params: SubjectDropDownParams
): Promise<SubjectDropDownListResponse> => {
  const res = await axios.get<SubjectDropDownListResponse>(`${URL_API_SUBJECT}`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

export const useSubjectDropDown = (params: SubjectDropDownParams) => {
  return useQuery<SubjectDropDownListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["subject-dropdown", params],
    queryFn: () => getSubjectDropDown(params),
  });
};
