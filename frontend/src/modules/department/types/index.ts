export interface IDepartments {
  id?: string;
  department_code: string;
  name: string;
  description: string;
  established_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface IDepartmentsDropDown {
  id: string;
  department_code: string;
  department_name: string;
}
