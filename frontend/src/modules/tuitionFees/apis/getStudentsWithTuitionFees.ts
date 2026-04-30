import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_STUDENT_TUITION_FEE } from "../../../constants/config";
import type { IStudentTuitionFeeListResponse } from "../types/studentTuitionFee";

export interface StudentTuitionFeeQueryParams {
  limit: number;
  skip: number;
  search?: string;
}

const getStudentsWithTuitionFees = async (
  params: StudentTuitionFeeQueryParams
): Promise<IStudentTuitionFeeListResponse> => {
  const res = await axios.get<IStudentTuitionFeeListResponse>(
    `${URL_API_STUDENT_TUITION_FEE}/students-with-tuition-fees`,
    {
      params,
      withCredentials: true,
    }
  );

  return res.data;
};

export const useGetStudentsWithTuitionFees = (params: StudentTuitionFeeQueryParams) => {
  return useQuery<IStudentTuitionFeeListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["students-with-tuition-fees", params],
    queryFn: () => getStudentsWithTuitionFees(params),
  });
};
