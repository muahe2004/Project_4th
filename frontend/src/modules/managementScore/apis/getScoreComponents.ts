import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";

import { URL_API_SCORE_COMPONENT } from "../../../constants/config";

export interface IScoreComponent {
  id: string;
  component_type: string;
  weight: number;
  description?: string | null;
}

const getScoreComponents = async (): Promise<IScoreComponent[]> => {
  const response = await axios.get<IScoreComponent[]>(URL_API_SCORE_COMPONENT, {
    withCredentials: true,
  });

  return response.data;
};

export const useGetScoreComponents = (
  options?: Omit<
    UseQueryOptions<IScoreComponent[], AxiosError<{ detail?: string }>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<IScoreComponent[], AxiosError<{ detail?: string }>>({
    queryKey: ["score-components"],
    queryFn: getScoreComponents,
    ...options,
  });
};
