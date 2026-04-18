import { useMutation } from "@tanstack/react-query";
import { URL_API_EXAMINATION_SCHEDULE } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IUploadExaminationScheduleResponse } from "../types";

const uploadExaminationSchedule = async (
  file: File
): Promise<IUploadExaminationScheduleResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    `${URL_API_EXAMINATION_SCHEDULE}/upload-file`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

type UseUploadExaminationScheduleOptions = {
  config?: MutationConfig<typeof uploadExaminationSchedule>;
};

export const useUploadExaminationSchedule = ({
  config,
}: UseUploadExaminationScheduleOptions = {}) => {
  return useMutation({
    mutationFn: uploadExaminationSchedule,
    ...config,
  });
};
