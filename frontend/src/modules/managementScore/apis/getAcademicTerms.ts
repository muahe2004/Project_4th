import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { URL_API_ACADEMIC_TERMS } from "../../../constants/config";
import { apiClient } from "../../../lib/api";

export interface IAcademicTermItem {
  id: string;
  semester: number | null;
  start_date: string;
  end_date: string;
  status?: string | null;
}

export interface IAcademicYearGroup {
  academic_year: string;
  terms: IAcademicTermItem[];
}

const getAcademicTerms = async (
  academicYearStart: number
): Promise<IAcademicYearGroup[]> => {
  const response = await apiClient.get<IAcademicYearGroup[]>(
    URL_API_ACADEMIC_TERMS,
    {
      params: { academic_year_start: academicYearStart },
    }
  );
  return response.data;
};

export const useGetAcademicTerms = (
  academicYearStart: number,
  options?: Omit<
    UseQueryOptions<IAcademicYearGroup[], AxiosError<{ detail?: string }>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<IAcademicYearGroup[], AxiosError<{ detail?: string }>>({
    queryKey: ["academic-terms", academicYearStart],
    queryFn: () => getAcademicTerms(academicYearStart),
    ...options,
  });
};
