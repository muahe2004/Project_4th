import { useMutation } from "@tanstack/react-query";
import { URL_API_CLASS } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";

export interface IRegisterCourseSectionItem {
    class_id: string;
    status: string;
    class_type: string;
}

export interface IRegisterCoursePayload {
    student_id: string;
    created_at: string;
    updated_at: string;
    course_sections: IRegisterCourseSectionItem[];
}

const registerCourse = async (data: IRegisterCoursePayload): Promise<any> => {
    const response = await apiClient.post(`${URL_API_CLASS}/register`, data);
    return response.data;
};

type UseRegisterCourseOptions = {
    config?: MutationConfig<typeof registerCourse>;
};

export const useRegisterCourse = ({ config }: UseRegisterCourseOptions = {}) => {
    return useMutation({
        mutationFn: registerCourse,
        ...config,
    });
};
