import axios, {AxiosError} from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_CLASS } from "../../../constants/config";
import type { ClassResponse } from "../types/index";

const getClasses = async (): Promise<ClassResponse[]> => {
    try {
        const res = await axios.get<ClassResponse[]>(`${URL_API_CLASS}`, { withCredentials: true });
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Unexpected error');
    }
}

export const useGetClasses = () => {
    return useQuery<ClassResponse[], AxiosError<{ detail?: string}>> ({
        queryKey: ["classes"],
        queryFn: () => getClasses(),
    });
}