export interface ITeacherInformation {
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

export interface ITeacherRelative {
  id?: string;
  name?: string | null;
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

export interface ITeacherInformationCreate {
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

export interface ITeacherRelativeCreate {
  name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  occupation?: string | null;
  phone?: string | null;
  address?: string | null;
  relationship?: string | null;
}

export interface ITeacher {
  id?: string;
  teacher_code: string;
  name: string;
  date_of_birth?: string | null;
  gender: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  academic_rank?: string | null;
  status: string;
  department_id?: string | null;
  password?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ITeacherResponse extends ITeacher {
  department_code?: string | null;
  department_name?: string | null;
  teacher_information?: ITeacherInformation | null;
  teacher_relative?: ITeacherRelative[] | null;
}

export interface ITeacherCreate extends ITeacher {
  teacher_information: ITeacherInformationCreate;
  teacher_relatives: ITeacherRelativeCreate[];
}

export interface ITeacherUpdate {
  teacher_code?: string;
  name?: string;
  date_of_birth?: string | null;
  gender?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  academic_rank?: string | null;
  status?: string | null;
  department_id?: string | null;
  updated_at?: string;
  teacher_information?: ITeacherInformationCreate | null;
  teacher_relatives?: ITeacherRelativeCreate[];
}

export interface TeacherListResponse {
  total: number;
  data: ITeacherResponse[];
}

export interface TeacherDeleteResponse {
  id: string;
  message: string;
}

export interface TeacherQueryParams {
  limit: number;
  skip: number;
  search?: string;
  status?: string;
  department_id?: string;
}

export interface TeacherDropDown {
  id: string;
  name: string;
  teacher_code?: string | null;
}

export interface ITeacherFileData {
  teacher_code?: string | null;
  name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ITeacherFileInvalidRow extends ITeacherFileData {
  row: number;
  errors: string[];
}

export interface ITeacherFileInfo {
  file_name: string;
  headers: string[];
  header_row: number;
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
}

export interface ITeacherUploadResponse {
  file_information: ITeacherFileInfo;
  teachers: ITeacherFileData[];
  invalid_teachers: ITeacherFileInvalidRow[];
}
