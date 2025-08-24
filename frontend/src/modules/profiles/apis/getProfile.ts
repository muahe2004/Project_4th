import axios, { AxiosError } from 'axios';
import { useQuery,  } from '@tanstack/react-query';
import { URL_API_TEACHER, URL_API_STUTDENT } from '../../../constants/config'

interface TeacherProfileResponse {
    teacher_code: string;
    name: string;
    date_of_birth:  string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    academic_rank: string;
    status: string;
    department_id: string;
    created_at: string;
    updated_at: string;
    id: string;
}

interface StudentProfileResponse {
    student_code: string;
    name: string;
    date_of_birth:  string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    class_id: string;
    status: string;
    training_program: string;
    course: string;
    created_at: string;
    updated_at: string;
    id: string;
}

const getTeacherProfile = async (id: string): Promise<TeacherProfileResponse> => {
    try {
        const res = await axios.get<TeacherProfileResponse>(`${URL_API_TEACHER}/${id}`, { withCredentials: true });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw error; 
        }
        throw new Error('Unexpected error');
    }
};

const getStudentProfile = async (id: string): Promise<StudentProfileResponse> => {
    try {
        const res = await axios.get<StudentProfileResponse>(`${URL_API_STUTDENT}/${id}`, { withCredentials: true });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw error; 
        }
        throw new Error('Unexpected error');
    }
}

export const useGetTeacherProfile = (id?: string,  enabled: boolean = true) => {
    return useQuery<TeacherProfileResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["teacher-profile", id],
        queryFn: () => getTeacherProfile(id!),
        enabled: !!id && enabled,
    });
};

export const useGetStudentProfile = (id?: string,  enabled: boolean = true) => {
    return useQuery<StudentProfileResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["student-profile", id],
        queryFn: () => getStudentProfile(id!),
        enabled: !!id && enabled,
    })
}