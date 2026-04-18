export interface IExaminationScheduleClassInfo {
  class_id: string;
  class_code?: string | null;
  class_name?: string | null;
}

export interface IExaminationScheduleSubjectInfo {
  subject_id: string;
  subject_code?: string | null;
  subject_name?: string | null;
}

export interface IExaminationScheduleRoomInfo {
  room_id: string;
  room_number?: number | null;
}

export interface IExaminationScheduleInvigilatorInfo {
  invigilator_id: string;
  invigilator_code?: string | null;
  invigilator_name?: string | null;
  invigilator_email?: string | null;
  invigilator_phone_number?: string | null;
}

export interface IExaminationScheduleResponse {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status?: string | null;
  schedule_type?: string | null;
  class_info?: IExaminationScheduleClassInfo | null;
  subject_info?: IExaminationScheduleSubjectInfo | null;
  room_info?: IExaminationScheduleRoomInfo | null;
  invigilator: IExaminationScheduleInvigilatorInfo[];
}

export interface IExaminationScheduleListResponse {
  total: number;
  data: IExaminationScheduleResponse[];
}

export interface IExaminationScheduleQueryParams {
  limit: number;
  skip: number;
  search?: string;
  status?: string;
  subject_id?: string;
  invigilator_id?: string;
  class_id?: string;
  student_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface IExaminationScheduleCreatePayload {
  class_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  room_id?: string | null;
  schedule_type?: string | null;
  status?: string | null;
  invigilator_1_id?: string | null;
  invigilator_2_id?: string | null;
}

export type IExaminationScheduleUpdatePayload = Partial<IExaminationScheduleCreatePayload> & {
  updated_at?: string;
};

export interface IUploadExaminationScheduleItem {
  subject_id?: string | null;
  subject_code?: string | null;
  subject_name?: string | null;
  class_id?: string | null;
  class_code?: string | null;
  class_name?: string | null;
  invigilator_1_id?: string | null;
  invigilator_1_code?: string | null;
  invigilator_1_name?: string | null;
  invigilator_2_id?: string | null;
  invigilator_2_code?: string | null;
  invigilator_2_name?: string | null;
  room_id?: string | null;
  room_number?: number | null;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  schedule_type?: string | null;
}

export interface IUploadExaminationScheduleInvalidRow extends IUploadExaminationScheduleItem {
  row: number;
  errors: string[];
}

export interface IUploadExaminationScheduleFileInfo {
  file_name: string;
  headers: string[];
  header_row: number;
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
}

export interface IUploadExaminationScheduleResponse {
  file_information: IUploadExaminationScheduleFileInfo;
  schedules: IUploadExaminationScheduleItem[];
  invalid_schedules: IUploadExaminationScheduleInvalidRow[];
}

export interface IImportExaminationScheduleItem {
  subject_id: string;
  class_id: string;
  date: string;
  start_time: string;
  end_time: string;
  room_id?: string | null;
  schedule_type?: string | null;
  status?: string | null;
  invigilator_1_id?: string | null;
  invigilator_2_id?: string | null;
}

export interface IImportExaminationSchedulePayload {
  schedules: IImportExaminationScheduleItem[];
}

export interface IImportExaminationScheduleImportedItem {
  row: number;
  id: string;
}

export interface IImportExaminationScheduleResponse {
  items: IImportExaminationScheduleImportedItem[];
}
