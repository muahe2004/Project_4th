export interface IStudents {
    id?: string;
    student_code: string;
    name: string;
    email: string;
    phone: string;
    date_of_birth?: string | null;
    gender: string;
    address?: string | null;
    training_program?: string | null;
    course?: string | null;
    status: string;
    class_id?: string;
    created_at?: string;
    updated_at?: string;
    password?: string;
}

export interface IStudentsResponse extends IStudents {
    class_code?: string;
    class_name?: string;
    student_information?: IStudentInformation | null;
    student_relative?: IStudentRelatives[];
}

export interface IStudentInformation {
    id?: string;
    place_of_origin?: string | null;
    exempted_group?: string | null;
    priority_group?: string | null;
    citizen_id?: string | null;
    issue_date?: string | null;
    issue_place?: string | null;
    nationality?: string | null;
    ethnicity?: string | null;
    religion?: string | null;
    insurance_number?: string | null;
    student_id?: string | null;
    teacher_id?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IStudentRelatives {
    id?: string;
    name: string;
    date_of_birth?: string | null;
    nationality?: string | null;
    ethnicity?: string | null;
    religion?: string | null;
    occupation?: string | null;
    phone?: string | null;
    address?: string | null;
    relationship?: string | null;
    student_id?: string | null;
    teacher_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IStudentCreate extends IStudents {
    student_information?: IStudentInformationCreate | null;
    student_relatives?: IStudentRelativesCreate[];
}

export interface IStudentInformationCreate {
    place_of_origin?: string | null;
    exempted_group?: string | null;
    priority_group?: string | null;
    citizen_id?: string | null;
    issue_date?: string | null;
    issue_place?: string | null;
    nationality?: string | null;
    ethnicity?: string | null;
    religion?: string | null;
    insurance_number?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
}

export interface IStudentRelativesCreate {
    name: string;
    date_of_birth?: string | null;
    nationality?: string | null;
    ethnicity?: string | null;
    religion?: string | null;
    occupation?: string | null;
    phone?: string | null;
    address?: string | null;
    relationship?: string | null;
}