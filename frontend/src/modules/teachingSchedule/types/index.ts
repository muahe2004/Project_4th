export interface ITeachingScheduleTeacher {
  teacher_id: string;
  teacher_name?: string | null;
  teacher_email?: string | null;
  teacher_phone?: string | null;
}

export interface ITeachingScheduleClass {
  class_id: string;
  class_name?: string | null;
  class_code?: string | null;
}

export interface ITeachingScheduleRoom {
  room_id: string;
  room_number?: number | null;
}

export interface ITeachingScheduleSubject {
  subject_id: string;
  subject_name?: string | null;
}

export interface ILearningSchedule {
  subject_id: string;
  class_id: string;
  room_id?: string | null;
  date: string;
  start_period: number;
  end_period: number;
  schedule_type?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
  id: string;
}

export interface ITeachingScheduleResponse {
  status?: string | null;
  created_at: string;
  updated_at: string;
  id: string;
  teacher?: ITeachingScheduleTeacher | null;
  learning_schedule: ILearningSchedule;
  class?: ITeachingScheduleClass | null;
  room?: ITeachingScheduleRoom | null;
  subject?: ITeachingScheduleSubject | null;
}

export interface IRoomWithLearningSchedulesRoomInformation {
  room_number: number;
  type: string;
  seats: number;
  status: string | null;
  created_at: string;
  updated_at: string;
  id: string;
}

export interface ITeachingScheduleInRoom {
  id: string;
  status?: string | null;
  created_at: string;
  updated_at: string;
  learning_schedule: ILearningSchedule;
  teacher?: ITeachingScheduleTeacher | null;
  class_info?: ITeachingScheduleClass | null;
  subject?: ITeachingScheduleSubject | null;
}

export interface IRoomWithLearningSchedules {
  room_information: IRoomWithLearningSchedulesRoomInformation;
  teaching_schedules: ITeachingScheduleInRoom[];
}

export interface IRoomWithLearningSchedulesResponse {
  total: number;
  data: IRoomWithLearningSchedules[];
}

export interface ITeachingScheduleWithRelations {
  id: string;
  status?: string | null;
  created_at: string;
  updated_at: string;
  learning_schedule: ILearningSchedule;
  teacher?: ITeachingScheduleTeacher | null;
  class_info?: ITeachingScheduleClass | null;
  room?: ITeachingScheduleRoom | null;
  subject?: ITeachingScheduleSubject | null;
}

export interface ITeacherWithLearningSchedules {
  teacher_information: {
    teacher_code: string;
    name: string;
    date_of_birth: string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    academic_rank: string | null;
    status: string | null;
    department_id: string;
    created_at: string;
    updated_at: string;
    password: string;
    id: string;
  };
  teaching_schedules: ITeachingScheduleWithRelations[];
}

export interface ITeacherWithLearningSchedulesResponse {
  total: number;
  data: ITeacherWithLearningSchedules[];
}

export interface IClassWithLearningSchedules {
  class_information: {
    class_code: string;
    class_name: string;
    size: number;
    status: string | null;
    created_at: string;
    updated_at: string;
    specialization_id: string;
    teacher_id: string | null;
    id: string;
  };
  teaching_schedules: ITeachingScheduleWithRelations[];
}

export interface IClassWithLearningSchedulesResponse {
  total: number;
  data: IClassWithLearningSchedules[];
}

export interface ITeachingScheduleCreatePayload {
  teacher_id?: string | null;
  status?: string | null;
  learning_schedule: {
    class_id: string;
    subject_id: string;
    date: string;
    start_period: number;
    end_period: number;
    room_id?: string | null;
    schedule_type?: string | null;
    status?: string | null;
  };
}

export interface ITeachingScheduleUpdatePayload {
  teacher_id?: string | null;
  status?: string | null;
  learning_schedule?: {
    class_id?: string;
    subject_id?: string;
    date?: string;
    start_period?: number;
    end_period?: number;
    room_id?: string | null;
    schedule_type?: string | null;
    status?: string | null;
  };
}

export interface IRoomDropDown {
  id: string;
  room_number: number;
  type: string;
  seats: number;
}

export interface ISubjectDropDown {
  id: string;
  subject_code: string;
  name: string;
}

export interface IUploadTeachingCalenderItem {
  subject_id?: string | null;
  subject_code?: string | null;
  subject_name?: string | null;
  teacher_id?: string | null;
  teacher_code?: string | null;
  teacher_name?: string | null;
  weeekday: number;
  room_id?: string | null;
  room_number?: number | null;
  lesson_periods: string;
  study_weeks: string;
}

export interface IUploadTeachingCalenderInvalidRow extends IUploadTeachingCalenderItem {
  row: number;
  errors: string[];
}

export interface IUploadTeachingCalenderFileInfo {
  file_name: string;
  headers: string[];
  header_row: number;
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
}

export interface IUploadTeachingCalenderResponse {
  class_code: string;
  period: {
    start_date: string;
    end_date: string;
  };
  file_information: IUploadTeachingCalenderFileInfo;
  schedules: IUploadTeachingCalenderItem[];
  invalid_schedules: IUploadTeachingCalenderInvalidRow[];
}

export interface IImportTeachingCalenderPayload {
  period: {
    start_date: string;
    end_date: string;
  };
  class_code: string;
  schedules: IUploadTeachingCalenderItem[];
}

export interface IImportTeachingCalenderItemResponse {
  row: number;
  date: string;
  learning_schedule_id: string;
  teaching_schedule_id: string;
}

export interface IImportTeachingCalenderResponse {
  items: IImportTeachingCalenderItemResponse[];
}
