import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { URL_API_CLASS } from "../../../constants/config";
import type { IClassesForRegisterResponse } from "../types";

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
    specialization_id?: string;
    teacher_id?: string;
}

const getClassesForRegister = async (
    params: Params
): Promise<IClassesForRegisterResponse> => {
    const res = await axios.get<IClassesForRegisterResponse>(
        `${URL_API_CLASS}/register`,
        {
            params,
            withCredentials: true,
        }
    );
    return res.data;
};

export const useGetClassesForRegister = (params: Params) => {
    return useQuery<IClassesForRegisterResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["classes-register", params],
        queryFn: () => getClassesForRegister(params),
    });
};
