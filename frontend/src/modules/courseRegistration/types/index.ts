import type { IClasses } from "../../classes/types";

export interface IClassesForRegisterInfo extends IClasses {
    id: string;
}

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

export interface IClassesRegisterSubject {
    subject_id: string;
    subject_code: string;
    subject_name: string;
    subject_credit: number;
}

export interface IClassesRegisterSchedule {
    date: string;
    start_period: number;
    end_period: number;
}

export interface IClassesForRegister {
    class_info: IClassesForRegisterInfo;
    teacher_info: IClassesRegisterTeacher;
    specialization_info: IClassesRegisterSpecialization;
    subject_info: IClassesRegisterSubject;
    schedule_info: IClassesRegisterSchedule[];
    is_registered: boolean;
}

export interface IClassesForRegisterResponse {
    data: IClassesForRegister[];
    total: number;
}

export type { IClasses, IClassesResponse } from "../../classes/types";
