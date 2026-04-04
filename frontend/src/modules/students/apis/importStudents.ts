import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_STUTDENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IStudentFileData } from "../types";

const importStudents = async (students: IStudentFileData[]): Promise<IStudentFileData[]> => {
    const response = await apiClient.post(`${URL_API_STUTDENT}/import-list`, students);
    return response.data;
};

type UseImportStudentsOptions = {
    config?: MutationConfig<typeof importStudents>;
};

export const useImportStudents = ({ config }: UseImportStudentsOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: importStudents,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["students"],
            });
        },
        ...config,
    });
};
