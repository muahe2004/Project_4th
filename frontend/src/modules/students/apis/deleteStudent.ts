import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_STUTDENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";

const deleteStudents = async (studentIds: string[]): Promise<any> => {
    const response = await apiClient.delete(URL_API_STUTDENT, {
        data: studentIds,
    });
    return response.data;
};

type UseDeleteStudentOptions = {
    config?: MutationConfig<typeof deleteStudents>;
};

export const useDeleteStudent = ({ config }: UseDeleteStudentOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteStudents,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["students"],
            });
        },
        ...config,
    });
};