import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_ROOM } from "../../../constants/config";
import type { IRoomDropDown } from "../types";

export interface RoomDropDownByIdsParams {
  ids: string[];
}

const getRoomDropDownByIds = async (
  params: RoomDropDownByIdsParams
): Promise<IRoomDropDown[]> => {
  const res = await axios.post<IRoomDropDown[]>(
    `${URL_API_ROOM}/dropdown-by-ids`,
    params,
    { withCredentials: true }
  );
  return res.data;
};

export const useRoomDropDownByIds = (params: RoomDropDownByIdsParams) => {
  return useQuery<IRoomDropDown[], AxiosError<{ detail?: string }>>({
    queryKey: ["room-dropdown-by-ids", params],
    queryFn: () => (params.ids.length ? getRoomDropDownByIds(params) : Promise.resolve([])),
  });
};
