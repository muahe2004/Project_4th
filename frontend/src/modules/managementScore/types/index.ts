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
