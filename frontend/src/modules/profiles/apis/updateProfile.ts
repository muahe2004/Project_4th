import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URL_API_STUTDENT, URL_API_TEACHER } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { IStudentUpdate } from "../../students/types";
import type { ITeacherUpdate } from "../../teachers/types";

type UpdateTeacherProfilePayload = {
  id: string;
  data: ITeacherUpdate;
};

type UpdateStudentProfilePayload = {
  id: string;
  data: IStudentUpdate;
};

const updateTeacherProfile = async ({ id, data }: UpdateTeacherProfilePayload) => {
  const response = await apiClient.patch(`${URL_API_TEACHER}/${id}`, data);
  return response.data;
};

const updateStudentProfile = async ({ id, data }: UpdateStudentProfilePayload) => {
  const response = await apiClient.patch(`${URL_API_STUTDENT}/${id}`, data);
  return response.data;
};

export const useUpdateTeacherProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeacherProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-information"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-relatives"] });
    },
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-information"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-relatives"] });
    },
  });
};
