import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_TRAINING_PROGRAM } from "../../../constants/config";
import type {
  ITrainingProgramDropDown,
  ITrainingProgramDropDownByIdsParams,
} from "../types";

const getTrainingProgramsDropDownByIds = async (
  params: ITrainingProgramDropDownByIdsParams
): Promise<ITrainingProgramDropDown[]> => {
  const res = await axios.post<ITrainingProgramDropDown[]>(
    `${URL_API_TRAINING_PROGRAM}/dropdown-by-ids`,
    params,
    {
      withCredentials: true,
    }
  );

  return res.data;
};

export const useTrainingProgramsDropDownByIds = (
  params: ITrainingProgramDropDownByIdsParams
) => {
  return useQuery<ITrainingProgramDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ["training-programs-dropdown-by-ids", params],
    queryFn: () =>
      params.ids.length ? getTrainingProgramsDropDownByIds(params) : Promise.resolve([]),
  });
};
