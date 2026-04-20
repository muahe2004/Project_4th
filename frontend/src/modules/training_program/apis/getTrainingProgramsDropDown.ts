import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";
import type {
  ITrainingProgramDropDown,
  ITrainingProgramDropDownParams,
} from "../types";

const getTrainingProgramsDropDown = async (
  params: ITrainingProgramDropDownParams
): Promise<ITrainingProgramDropDown[]> => {
  const res = await axios.get<ITrainingProgramDropDown[]>(
    `${URL_API_TRAINING_PROGRAM}/dropdown`,
    {
      params,
      withCredentials: true,
    }
  );

  return res.data;
};

export const useTrainingProgramsDropDown = (params: ITrainingProgramDropDownParams) => {
  return useQuery<ITrainingProgramDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ["training-programs-dropdown", params],
    queryFn: () => getTrainingProgramsDropDown(params),
  });
};
