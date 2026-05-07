import { useMutation } from "@tanstack/react-query";
import { URL_API_SCORE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IScoreUploadResponse } from "../types";

const uploadScore = async (file: File): Promise<IScoreUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    `${URL_API_SCORE}/upload-file`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

type UseUploadScoreOptions = {
  config?: MutationConfig<typeof uploadScore>;
};

export const useUploadScore = ({ config }: UseUploadScoreOptions = {}) => {
  return useMutation({
    mutationFn: uploadScore,
    ...config,
  });
};
