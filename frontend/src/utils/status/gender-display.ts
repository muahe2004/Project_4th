import { GENDER } from "../../constants/gender";

export const getGenderDisplay = (gender: string): string => {
    switch (gender) {
        case GENDER.MALE:
            return "Nam";
        case GENDER.FEMALE:
            return "Nữ";
        default:
            return "Unknown";
    }
}