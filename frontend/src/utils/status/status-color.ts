import { STATUS } from "../../constants/status";

export const getStatusColor = ( status: string): string => {
    switch (status) {
        case STATUS.ACTIVE:
            return "green";
        case STATUS.INACTIVE:
            return "red";
        default:
            return "#a8a8a8";
    }
};