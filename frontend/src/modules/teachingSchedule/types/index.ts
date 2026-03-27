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
