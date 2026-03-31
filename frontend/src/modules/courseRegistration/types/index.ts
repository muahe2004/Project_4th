import type { IClasses } from "../../classes/types";

export interface IClassesRegisterTeacher {
    teacher_id: string;
    teacher_name: string;
    teacher_code: string;
    teacher_email?: string | null;
    teacher_phone?: string | null;
}

export interface IClassesRegisterSpecialization {
    specialization_id: string;
    specialization_code: string;
    specialization_name: string;
}

export interface IClassesForRegister {
    class_info: IClasses;
    teacher_info: IClassesRegisterTeacher;
    specialization_info: IClassesRegisterSpecialization;
}

export interface IClassesForRegisterResponse {
    data: IClassesForRegister[];
    total: number;
}

export type { IClasses, IClassesResponse } from "../../classes/types";
