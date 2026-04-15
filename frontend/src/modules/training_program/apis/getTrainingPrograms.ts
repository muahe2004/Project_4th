import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";
import type {
  ITrainingProgramListResponse,
  ITrainingProgramQueryParams,
} from "../types";

const getTrainingPrograms = async (
  params: ITrainingProgramQueryParams
): Promise<ITrainingProgramListResponse> => {
  const res = await axios.get<ITrainingProgramListResponse>(
    `${URL_API_TRAINING_PROGRAM}`,
    {
      params,
      withCredentials: true,
    }
  );

  return res.data;
};

export const useGetTrainingPrograms = (params: ITrainingProgramQueryParams) => {
  return useQuery<ITrainingProgramListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["training-programs", params],
    queryFn: () => getTrainingPrograms(params),
  });
};
