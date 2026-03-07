import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_STUTDENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IStudentUpdate } from "../types";

interface UpdateStudentPayload {
    studentId: string;
    data: IStudentUpdate;
}

const updateStudent = async ({ studentId, data }: UpdateStudentPayload): Promise<any> => {
    const response = await apiClient.patch(`${URL_API_STUTDENT}/${studentId}`, data);
    return response.data;
};

type UseUpdateStudentOptions = {
    config?: MutationConfig<typeof updateStudent>;
};

export const useUpdateStudent = ({ config }: UseUpdateStudentOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudent,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["students"],
            });
        },
        ...config,
    });
};