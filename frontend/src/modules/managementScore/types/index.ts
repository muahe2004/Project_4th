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
