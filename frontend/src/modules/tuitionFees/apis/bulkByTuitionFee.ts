import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { URL_API_STUDENT_TUITION_FEE } from "../../../constants/config";

export interface StudentTuitionFeeBulkCreatePayload {
  department_ids: string[];
}

export interface StudentTuitionFeeBulkCreateResponse {
  department_ids: string[];
  matched_students: number;
  created_records: number;
  skipped_no_class: number;
  skipped_no_term_match: number;
  skipped_no_specialization_match: number;
  skipped_no_major_match: number;
  skipped_duplicate: number;
}

const bulkByTuitionFee = async (
  data: StudentTuitionFeeBulkCreatePayload
): Promise<StudentTuitionFeeBulkCreateResponse> => {
  const response = await axios.post<StudentTuitionFeeBulkCreateResponse>(
    `${URL_API_STUDENT_TUITION_FEE}/bulk-by-tuition-fee`,
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const useBulkStudentTuitionFeeByDepartment = () => {
  return useMutation<
    StudentTuitionFeeBulkCreateResponse,
    AxiosError<{ detail?: string }>,
    StudentTuitionFeeBulkCreatePayload
  >({
    mutationFn: bulkByTuitionFee,
  });
};
