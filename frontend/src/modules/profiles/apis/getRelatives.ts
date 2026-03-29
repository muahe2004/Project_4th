import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_RELATIVES } from "../../../constants/config";

export interface RelativeResponse {
  name: string;
  date_of_birth: string | null;
  nationality: string | null;
  ethnicity: string | null;
  religion: string | null;
  occupation: string | null;
  phone: string | null;
  address: string | null;
  relationship: string | null;
  student_id: string | null;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
  id: string;
}

const getCurrentUserRelatives = async (): Promise<RelativeResponse[]> => {
  try {
    const res = await axios.get<RelativeResponse[]>(`${URL_API_RELATIVES}/me`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Unexpected error");
  }
};

export const useGetCurrentUserRelatives = (enabled: boolean = true) => {
  return useQuery<RelativeResponse[], AxiosError<{ detail?: string }>>({
    queryKey: ["current-user-relatives"],
    queryFn: () => getCurrentUserRelatives(),
    enabled,
  });
};
