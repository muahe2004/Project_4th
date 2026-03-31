export interface IClasses {
    id?: string;
    class_code: string;
    class_name?: string;
    specialization_id: string;
    size: number;
    status: string;
    teacher_id: string;
    class_type?: string | null;
    registration_status?: string | null;
    subject_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IClassesResponse extends IClasses {
    specialization_name: string;
    teacher_name: string;
}

export interface IClassesDropDown {
    id: string;
    class_name: string;
    class_code: string;
}
