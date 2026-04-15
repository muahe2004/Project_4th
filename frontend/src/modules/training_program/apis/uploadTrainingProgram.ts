import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";
import type { ITrainingProgramUploadResponse } from "../types";

const uploadTrainingProgram = async (file: File): Promise<ITrainingProgramUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post<ITrainingProgramUploadResponse>(
    `${URL_API_TRAINING_PROGRAM}/upload-file`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const useUploadTrainingProgram = () => {
  return useMutation<ITrainingProgramUploadResponse, AxiosError<{ detail?: string }>, File>({
    mutationFn: (file: File) => uploadTrainingProgram(file),
  });
};
