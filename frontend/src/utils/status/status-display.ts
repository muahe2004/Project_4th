import { STATUS } from "../../constants/status";

export const getStatusDisplay = ( status: string): string => {
    switch (status) {
        case STATUS.ACTIVE:
            return "Active";
        case STATUS.INACTIVE:
            return "Inactive";
        default:
            return "Unknown";
    }
};