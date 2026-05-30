import { getStatusDisplay as getStatusDisplayI18n } from "./status-i18n";

export const getStatusDisplay = ( status: string): string => {
    return getStatusDisplayI18n(status);
};
