import { useMutation } from "@tanstack/react-query";
import { URL_API_STUTDENT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IStudentUploadResponse } from "../types";

const uploadStudent = async (file: File): Promise<IStudentUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
        `${URL_API_STUTDENT}/upload-file`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

type UseUploadStudentOptions = {
    config?: MutationConfig<typeof uploadStudent>;
};

export const useUploadStudent = ({ config }: UseUploadStudentOptions = {}) => {
    return useMutation({
        mutationFn: uploadStudent,
        ...config,
    });
};
