export interface ITuitionFeeTrainingProgramInfo {
  id: string;
  program_type: string;
  training_program_name?: string | null;
  academic_year: string;
}

export interface ITuitionFeeSpecializationInfo {
  id: string;
  specialization_code: string;
  specialization_name: string;
}

export interface ITuitionFeeMajorInfo {
  id: string;
  major_code: string;
  major_name: string;
}

export interface ITuitionFeeDepartmentInfo {
  id: string;
  department_code: string;
  department_name: string;
}

export interface ITuitionFeeSubjectInfo {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  subject_credit: number;
}

export interface ITuitionFee {
  id: string;
  academic_year: string;
  amount: number;
  price_per_credit: number;
  training_program_id: string;
  term?: number | null;
  type?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  name?: string | null;
  created_at: string;
  updated_at: string;
  training_program_info: ITuitionFeeTrainingProgramInfo;
  specialization_infor: ITuitionFeeSpecializationInfo;
  major_infor: ITuitionFeeMajorInfo;
  department_info: ITuitionFeeDepartmentInfo;
  subject_info?: ITuitionFeeSubjectInfo[];
}

export interface TuitionFeeListResponse {
  total: number;
  data: ITuitionFee[];
}

export interface TuitionFeeQueryParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
  training_program_id?: string;
  specialization_id?: string;
  major_id?: string;
  department_id?: string;
}

export type TuitionFeeCreatePayload = {
  academic_year: string;
  price_per_credit: number;
  department_id: string;
  type?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  name?: string | null;
};

export type TuitionFeeUpdatePayload = Partial<TuitionFeeCreatePayload> & {
  training_program_id?: string;
  updated_at?: string;
};
