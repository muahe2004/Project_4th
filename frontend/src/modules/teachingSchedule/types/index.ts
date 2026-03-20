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
}

export interface ISubjectDropDown {
  id: string;
  subject_code: string;
  name: string;
}
