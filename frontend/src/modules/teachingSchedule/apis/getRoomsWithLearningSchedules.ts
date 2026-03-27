import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_ROOM } from "../../../constants/config";
import type { IRoomWithLearningSchedulesResponse } from "../types";

export interface RoomWithLearningSchedulesParams {
  limit: number;
  skip: number;
}

const getRoomsWithLearningSchedules = async (
  params: RoomWithLearningSchedulesParams
): Promise<IRoomWithLearningSchedulesResponse> => {
  const res = await axios.get<IRoomWithLearningSchedulesResponse>(
    `${URL_API_ROOM}/with-learning-schedules`,
    {
      params,
      withCredentials: true,
    }
  );
  return res.data;
};

export const useGetRoomsWithLearningSchedules = (
  params: RoomWithLearningSchedulesParams,
  enabled = true
) => {
  return useQuery<IRoomWithLearningSchedulesResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["rooms-with-learning-schedules", params],
    queryFn: () => getRoomsWithLearningSchedules(params),
    enabled,
  });
};
