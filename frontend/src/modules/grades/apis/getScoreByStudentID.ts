import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_SCORE } from "../../../constants/config";
import type {
  StudentScoreByStudentResponse,
  StudentScoreFilterParams,
} from "../types";

const getScoreByStudentID = async (
  studentId: string,
  params: StudentScoreFilterParams = {}
): Promise<StudentScoreByStudentResponse> => {
  const res = await axios.get<StudentScoreByStudentResponse>(
    `${URL_API_SCORE}/student/${studentId}`,
    {
      params,
      withCredentials: true,
    }
  );

  return res.data;
};

export const useGetScoreByStudentID = (
  studentId?: string,
  params: StudentScoreFilterParams = {},
  enabled = true
) => {
  return useQuery<StudentScoreByStudentResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["scores", "student", studentId, params],
    queryFn: () => getScoreByStudentID(studentId as string, params),
    enabled: enabled && Boolean(studentId),
  });
};
