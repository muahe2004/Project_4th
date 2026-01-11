export interface IStudents {
    id?: string;
    student_code: string;
    name: string;
    email: string;
    date_of_birth?: string | null;
    gender?: string | null;
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
    student_information?: any;
}