import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { URL_API_ROOM } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { IRoom, RoomUpdatePayload } from "../types";

const updateRoom = async (id: string, data: RoomUpdatePayload): Promise<IRoom> => {
  const response = await apiClient.patch<IRoom>(`${URL_API_ROOM}/${id}`, data);
  return response.data;
};

export const useUpdateRoom = (
  config?: UseMutationOptions<IRoom, Error, { id: string; data: RoomUpdatePayload }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateRoom(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
