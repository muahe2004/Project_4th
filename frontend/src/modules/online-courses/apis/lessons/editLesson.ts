import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { ILessons } from "../../types";
import { URL_API_LESSON } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";
// import { URL_API_COURSE } from "../../../constants/config";
// import { apiClient } from "../../../lib/api";
// import type { ICourses } from "../types";

export type LessonEditDto = Partial<ILessons>;

export type EditLessonResponse = ILessons;

const editLesson = async (
    id: string,
    data: LessonEditDto,
): Promise<EditLessonResponse> => {
    const response = await apiClient.patch(`${URL_API_LESSON}/${id}`, data);
    return response.data;
}

export const useEditLesson = (
    config?: UseMutationOptions<EditLessonResponse, Error, {id: string; data: LessonEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editLesson(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["lessons"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}