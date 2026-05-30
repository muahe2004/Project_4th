import i18n from "../../locale/i18n";
import { STATUS } from "../../constants/status";

export const getStatusDisplay = (status: string): string => {
    switch (status) {
        case STATUS.ACTIVE:
            return i18n.t("common.status.active");
        case STATUS.INACTIVE:
            return i18n.t("common.status.inactive");
        default:
            return i18n.t("common.status.unknown");
    }
};

export const getStatusOptions = () => [
    { value: STATUS.ACTIVE, label: i18n.t("common.status.active") },
    { value: STATUS.INACTIVE, label: i18n.t("common.status.inactive") },
];
