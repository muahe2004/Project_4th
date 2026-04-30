export interface IStudentTuitionFeeTrainingProgramInfo {
  id: string;
  program_type: string;
  training_program_name?: string | null;
  academic_year: string;
}

export interface IStudentTuitionFeeSpecializationInfo {
  id: string;
  specialization_code: string;
  specialization_name: string;
}

export interface IStudentTuitionFeeMajorInfo {
  id: string;
  major_code: string;
  major_name: string;
}

export interface IStudentTuitionFeeDepartmentInfo {
  id: string;
  department_code: string;
  department_name: string;
}

export interface IStudentTuitionFeeSubjectInfo {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  subject_credit: number;
}

export interface IStudentTuitionFeeTuitionFee {
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
  training_program_info: IStudentTuitionFeeTrainingProgramInfo;
  specialization_infor: IStudentTuitionFeeSpecializationInfo;
  major_infor: IStudentTuitionFeeMajorInfo;
  department_info: IStudentTuitionFeeDepartmentInfo;
  subject_info?: IStudentTuitionFeeSubjectInfo[];
}

export interface IStudentTuitionFeeRow {
  student_id: string;
  student_code: string;
  student_name: string;
  class_id?: string | null;
  class_code?: string | null;
  class_name?: string | null;
  tuition_fees: {
    id: string;
    student_id: string;
    tuition_fee_id: string;
    reduction?: number | null;
    payable_amount: number;
    paid_amount?: number | null;
    debt_amount?: number | null;
    surplus?: number | null;
    created_at: string;
    updated_at: string;
    tuition_fee: IStudentTuitionFeeTuitionFee;
  }[];
}

export interface IStudentTuitionFeeListResponse {
  total: number;
  data: IStudentTuitionFeeRow[];
}
