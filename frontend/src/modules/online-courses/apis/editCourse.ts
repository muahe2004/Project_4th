import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_COURSE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { ICourses } from "../types";

export type CourseEditDto = Partial<ICourses>;

export type EditCourseResponse = ICourses;

const editCourse = async (
    id: string,
    data: CourseEditDto,
): Promise<EditCourseResponse> => {
    const response = await apiClient.patch(`${URL_API_COURSE}/${id}`, data);
    return response.data;
}

export const useEditCourse = (
    config?: UseMutationOptions<EditCourseResponse, Error, {id: string; data: CourseEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editCourse(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}