import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_SCORE } from "../../../constants/config";
import type {
  IManagementScoreQueryParams,
  IStudentGpaListResponse,
} from "../types";

const getStudentGPA = async (
  params: IManagementScoreQueryParams = {}
): Promise<IStudentGpaListResponse> => {
  const res = await axios.get<IStudentGpaListResponse>(
    `${URL_API_SCORE}/students/gpa`,
    {
      params,
      withCredentials: true,
    }
  );

  return res.data;
};

export const useGetStudentGPA = (
  params: IManagementScoreQueryParams = {}
) => {
  return useQuery<IStudentGpaListResponse>({
    queryKey: ["student-gpa", params],
    queryFn: () => getStudentGPA(params),
  });
};
