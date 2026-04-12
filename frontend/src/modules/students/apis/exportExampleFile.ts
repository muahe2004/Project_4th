import type { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { URL_API_EXPORT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";


const getFileNameFromDisposition = (contentDisposition?: string) => {
    if (!contentDisposition) {
        return "students_template.xlsx";
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    if (asciiMatch?.[1]) {
        return asciiMatch[1];
    }

    return "students_template.xlsx";
};

const exportExampleFile = async (): Promise<void> => {
    const response = await apiClient.get(`${URL_API_EXPORT}/students-template`, {
        responseType: "blob",
    });

    const blob = new Blob([
        response.data,
    ], {
        type: response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = getFileNameFromDisposition(response.headers["content-disposition"]);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
};

type UseExportExampleFileOptions = {
    config?: {
        onSuccess?: () => void;
        onError?: (error: AxiosError) => void;
    };
};

export const useExportExampleFile = ({ config }: UseExportExampleFileOptions = {}) => useMutation({
    mutationFn: exportExampleFile,
    ...config,
});
