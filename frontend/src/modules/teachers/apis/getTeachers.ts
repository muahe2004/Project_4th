import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_TEACHER } from "../../../constants/config";
import type { TeacherListResponse, TeacherQueryParams } from "../types";

const getTeachers = async (
  params: TeacherQueryParams
): Promise<TeacherListResponse> => {
  const res = await axios.get<TeacherListResponse>(`${URL_API_TEACHER}`, {
    params,
    withCredentials: true,
  });

  return res.data;
};

export const useGetTeachers = (params: TeacherQueryParams) => {
  return useQuery<TeacherListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["teachers", params],
    queryFn: () => getTeachers(params),
  });
};
