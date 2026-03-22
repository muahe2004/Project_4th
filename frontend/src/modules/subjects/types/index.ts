export interface ISubject {
  id?: string;
  subject_code: string;
  name: string;
  credit: number;
  description?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export type ISubjectCreate = Pick<
  ISubject,
  "subject_code" | "name" | "credit" | "description" | "status"
>;

export type ISubjectUpdate = Partial<ISubjectCreate> & {
  updated_at?: string;
};

export interface SubjectListResponse {
  total: number;
  data: ISubject[];
}

export interface SubjectDeleteResponse {
  id: string;
  message: string;
}

export interface SubjectQueryParams {
  limit: number;
  skip: number;
  search?: string;
  status?: string;
}
