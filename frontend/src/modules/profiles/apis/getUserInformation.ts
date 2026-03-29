import axios, { AxiosError } from 'axios';
import { useQuery,  } from '@tanstack/react-query';
import { URL_API_USER_INFORMATION } from '../../../constants/config'

export interface UserInformationResponse {
    place_of_origin: string;
    exempted_group: string;
    priority_group: string;
    citizen_id: string;
    issue_date: string;
    issue_place: string;
    nationality: string;
    ethnicity: string;
    religion: string;
    insurance_number: string;
    student_id: string;
    teacher_id: string;
    bank_name: string;
    bank_account_number: string;
    created_at: string;
    updated_at: string;
    id: string;
}

const getInformationTeacher = async (id: string): Promise<UserInformationResponse> => {
    try {
        const res = await axios.get<UserInformationResponse>(`${URL_API_USER_INFORMATION}/teacher/${id}`, { withCredentials: true });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
        throw error; 
        }
        throw new Error('Unexpected error');
    }
};

const getInformationStudent = async (id: string): Promise<UserInformationResponse> => {
    try {
        const res = await axios.get<UserInformationResponse>(`${URL_API_USER_INFORMATION}/student/${id}`, { withCredentials: true });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
        throw error; 
        }
        throw new Error('Unexpected error');
    }
};

const getCurrentUserInformation = async (): Promise<UserInformationResponse> => {
    try {
        const res = await axios.get<UserInformationResponse>(`${URL_API_USER_INFORMATION}/me`, { withCredentials: true });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Unexpected error');
    }
};

export const useGetProfileTeacher = (id?: string, enabled: boolean = true) => {
  return useQuery<UserInformationResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["teacher-information", id],
    queryFn: () => getInformationTeacher(id!),
    enabled: !!id && enabled,
  });
};

export const useGetProfileStudent = (id?: string, enabled: boolean = true) => {
    return useQuery<UserInformationResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["student-information", id],
        queryFn: () => getInformationStudent(id!),
        enabled: !!id && enabled,
    });
};

export const useGetCurrentUserInformation = (enabled: boolean = true) => {
    return useQuery<UserInformationResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["current-user-information"],
        queryFn: () => getCurrentUserInformation(),
        enabled,
    });
};
