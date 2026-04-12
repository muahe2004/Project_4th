import { useMutation } from "@tanstack/react-query";
import { URL_API_TEACHING_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IUploadTeachingCalenderResponse } from "../types";

const uploadCalender = async (file: File): Promise<IUploadTeachingCalenderResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    `${URL_API_TEACHING_SCHEDULE}/upload-file`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

type UseUploadCalenderOptions = {
  config?: MutationConfig<typeof uploadCalender>;
};

export const useUploadCalender = ({ config }: UseUploadCalenderOptions = {}) => {
  return useMutation({
    mutationFn: uploadCalender,
    ...config,
  });
};
