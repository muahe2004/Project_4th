import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { URL_API_LESSON } from "../../../../constants/config";
// import { URL_API_COURSE } from "../../../constants/config";

const deleteLesson = async (id: string): Promise<{ message: string }> => {
    try {
        const res = await axios.delete<{ message: string }>(
            `${URL_API_LESSON}/${id}`,
        );
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error("Unexpected error");
    }
};

export const useDeleteLesson = () => {
    return useMutation<
        { message: string },
        AxiosError<{ detail?: string }>,
        string
    >({
        mutationFn: (id: string) => deleteLesson(id),
    });
};