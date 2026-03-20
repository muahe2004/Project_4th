import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_ROOM } from "../../../constants/config";
import type { IRoomDropDown } from "../types";

export interface RoomDropDownParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
}

const getRoomDropDown = async (
  params: RoomDropDownParams
): Promise<IRoomDropDown[]> => {
  const res = await axios.get<IRoomDropDown[]>(`${URL_API_ROOM}/dropdown`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

export const useRoomDropDown = (params: RoomDropDownParams) => {
  return useQuery<IRoomDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ["room-dropdown", params],
    queryFn: () => getRoomDropDown(params),
  });
};
