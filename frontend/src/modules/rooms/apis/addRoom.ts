import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_ROOM } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IRoom, RoomCreatePayload } from "../types";

const createRoom = async (data: RoomCreatePayload): Promise<IRoom> => {
  const response = await apiClient.post<IRoom>(`${URL_API_ROOM}`, data);
  return response.data;
};

type UseCreateRoomOptions = {
  config?: MutationConfig<typeof createRoom>;
};

export const useCreateRoom = ({ config }: UseCreateRoomOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
    ...config,
  });
};
