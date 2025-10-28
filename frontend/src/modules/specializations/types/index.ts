export interface ISpecializations {
  id?: string;
  specialization_code: string;
  name: string;
  description: string;
  established_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  major_id: string;
}

export interface SpecializationsDropDown {
    id: string;
    name: string;
}