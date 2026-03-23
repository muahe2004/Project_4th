import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_ROOM } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { RoomDeleteResponse } from "../types";

const deleteRoom = async (id: string): Promise<RoomDeleteResponse> => {
  const response = await apiClient.delete<RoomDeleteResponse>(`${URL_API_ROOM}/${id}`);
  return response.data;
};

type UseDeleteRoomOptions = {
  config?: MutationConfig<typeof deleteRoom>;
};

export const useDeleteRoom = ({ config }: UseDeleteRoomOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
    ...config,
  });
};
