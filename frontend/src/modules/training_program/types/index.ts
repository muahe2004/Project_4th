export interface ITrainingProgramSubjectDetail {
  id: string;
  training_program_id: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  credit: number;
  term: number;
  status?: string | null;
}

export interface ITrainingProgramDepartmentInfo {
  id: string;
  department_code: string;
  department_name: string;
}

export interface ITrainingProgramMajorInfo {
  id: string;
  major_code: string;
  major_name: string;
}

export interface ITrainingProgramSpecializationInfo {
  id: string;
  specialization_code: string;
  specialization_name: string;
}

export interface ITrainingProgram {
  id: string;
  program_type: string;
  training_program_name?: string | null;
  academic_year: string;
  specialization_id: string;
  specialization_infor: ITrainingProgramSpecializationInfo;
  major_infor: ITrainingProgramMajorInfo;
  department_info: ITrainingProgramDepartmentInfo;
  status?: string | null;
  subjects: ITrainingProgramSubjectDetail[];
}

export interface ITrainingProgramListResponse {
  total: number;
  data: ITrainingProgram[];
}

export interface ITrainingProgramQueryParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
  specialization_id?: string;
}

export interface ITrainingProgramFileSubjectData {
  subject_code?: string | null;
  subject_name?: string | null;
  term?: number | null;
}

export interface ITrainingProgramFileInvalidSubject extends ITrainingProgramFileSubjectData {
  row: number;
  errors: string[];
}

export interface ITrainingProgramFileInfo {
  file_name: string;
  headers: string[];
  header_row: number;
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
  parsed_at: string;
}

export interface ITrainingProgramFileData {
  program_type?: string | null;
  training_program_name?: string | null;
  academic_year?: string | null;
  specialization_code?: string | null;
  specialization_name?: string | null;
  subjects: ITrainingProgramFileSubjectData[];
}

export interface ITrainingProgramImportSubjectData {
  subject_code: string;
  subject_name: string;
  term: number;
}

export interface ITrainingProgramImportPayload {
  program_type: string;
  training_program_name?: string | null;
  academic_year: string;
  specialization_code: string;
  specialization_name?: string | null;
  status?: string | null;
  subjects: ITrainingProgramImportSubjectData[];
}

export interface ITrainingProgramUploadResponse {
  file_information: ITrainingProgramFileInfo;
  training_program: ITrainingProgramFileData;
  invalid_subjects: ITrainingProgramFileInvalidSubject[];
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

export interface ITeacherUploadResponse {
  file_information: {
    file_name: string;
  };
  teachers: ITeacherFileData[];
  invalid_teachers: ITeacherFileInvalidRow[];
}
