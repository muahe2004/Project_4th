import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { ILectures } from "../../types";
import { URL_API_LECTURE } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";

export type LectureEditDto = Partial<ILectures>;

export type EditLectureResponse = ILectures;

const editLecture = async (
    id: string,
    data: LectureEditDto,
): Promise<EditLectureResponse> => {
    const response = await apiClient.patch(`${URL_API_LECTURE}/${id}`, data);
    return response.data;
}

export const useEditLecture = (
    config?: UseMutationOptions<EditLectureResponse, Error, {id: string; data: LectureEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editLecture(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["lectures"] });
            config?.onSuccess?.(data, variables, context);
        },
        ...config,
    });
}