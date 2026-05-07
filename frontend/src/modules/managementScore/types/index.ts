export interface IManagementScoreQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
  class_id?: string;
}

export interface IStudentGpaStudentInfo {
  id: string;
  student_code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface IStudentGpaClassInfo {
  class_id?: string | null;
  class_code?: string | null;
  class_name?: string | null;
}

export interface IStudentGpaSummary {
  grade4: string;
  grade10: string;
  gpa4: number;
  accumulated_gpa4: number;
  accumulated_gpa10: number;
}

export interface IStudentGpaItem {
  student_info: IStudentGpaStudentInfo;
  class_info: IStudentGpaClassInfo;
  gpa: IStudentGpaSummary;
}

export interface IStudentGpaListResponse {
  data: IStudentGpaItem[];
  total: number;
}

export interface IManagementScoreTableRow extends IStudentGpaItem {
}

export interface IStudentScoreComponentResponse {
  id: string;
  component_type: string;
  weight: number;
  description?: string | null;
}

export interface IStudentScoreItemResponse {
  id: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  subject_credit: number;
  academic_term_id: string;
  academic_year: string;
  semester?: number | null;
  score: number;
  attempt: number;
  score_type?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
  score_component: IStudentScoreComponentResponse;
}

export interface IStudentScoreInfoResponse {
  id: string;
  student_code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface IStudentScoreByClassSubjectItem {
  student_info: IStudentScoreInfoResponse;
  scores: IStudentScoreItemResponse[];
}

export interface IScoreByClassSubjectResponse {
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  students: IStudentScoreByClassSubjectItem[];
  total_students: number;
}

export interface IScoreUploadRow {
  row: number;
  stt?: number | null;
  class_code?: string | null;
  student_code?: string | null;
  student_id?: string | null;
  student_name?: string | null;
  family_name?: string | null;
  given_name?: string | null;
  d1?: number | null;
  d2?: number | null;
  thi?: number | null;
  tbm?: number | null;
  note?: string | null;
}

export interface IScoreUploadInvalidRow extends IScoreUploadRow {
  errors: string[];
}

export interface IScoreUploadFileInfo {
  file_name: string;
  headers: string[];
  header_row: number;
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
  class_code?: string | null;
  academic_year?: string | null;
  semester?: number | null;
  academic_term_id?: string | null;
  subject_name?: string | null;
  subject_code?: string | null;
  subject_id?: string | null;
  attempt?: number | null;
}

export interface IScoreUploadResponse {
  file_information: IScoreUploadFileInfo;
  scores: IScoreUploadRow[];
  invalid_scores: IScoreUploadInvalidRow[];
}
