import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_ROOM } from "../../../constants/config";
import type { RoomListResponse, RoomQueryParams } from "../types";

const getRooms = async (params: RoomQueryParams): Promise<RoomListResponse> => {
  const res = await axios.get<RoomListResponse>(`${URL_API_ROOM}`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

export const useGetRooms = (params: RoomQueryParams) => {
  return useQuery<RoomListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["rooms", params],
    queryFn: () => getRooms(params),
  });
};
