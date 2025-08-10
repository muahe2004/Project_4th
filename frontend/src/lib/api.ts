import axios from "axios";
import { BASE_UNICORE_API_URL } from "../constants/config";

export const apiClient = axios.create({
  baseURL: BASE_UNICORE_API_URL,
  timeout: 1000 * 60 * 30 * 3,
  withCredentials: true, 
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status;

        if (status === 401) {
        window.location.href = "/sign-in";
        return Promise.reject({
            message: "Unauthorized: Invalid or expired token",
            code: 401,
            custom: true,
        });
        }

        if (status === 404) {
        return Promise.reject({
            message: "Not Found",
            code: 404,
            custom: true,
            data: error.response?.data,
        });
        }

        if (status === 500) {
        return Promise.reject({
            message: "Internal Server Error",
            code: 500,
            custom: true,
            data: error.response?.data,
        });
        }

        return Promise.reject(error);
    }
);
