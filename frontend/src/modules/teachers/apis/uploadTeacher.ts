import { useMutation } from "@tanstack/react-query";
import { URL_API_TEACHER } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ITeacherUploadResponse } from "../types";

const uploadTeacher = async (file: File): Promise<ITeacherUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    `${URL_API_TEACHER}/upload-file`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

type UseUploadTeacherOptions = {
  config?: MutationConfig<typeof uploadTeacher>;
};

export const useUploadTeacher = ({ config }: UseUploadTeacherOptions = {}) => {
  return useMutation({
    mutationFn: uploadTeacher,
    ...config,
  });
};
