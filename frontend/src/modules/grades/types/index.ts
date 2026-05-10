export interface StudentScoreFilterParams {
  academic_term_id?: string;
  subject_id?: string;
}

export interface StudentInfoScoreResponse {
  id: string;
  student_code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface StudentScoreComponentResponse {
  id: string;
  component_type: string;
  weight: number;
  description?: string | null;
}

export interface StudentScoreItemResponse {
  id: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  subject_credit: number;
  academic_term_id: string;
  academic_year: string;
  semester?: number | null;
  score: number;
  attempt: number;
  score_type: string;
  status?: string | null;
  created_at: string;
  updated_at: string;
  score_component: StudentScoreComponentResponse;
}

export interface StudentScoreByStudentResponse {
  student_info: StudentInfoScoreResponse;
  scores: {
    items: StudentScoreItemResponse[];
    total: number;
  };
}

export interface ScorePoint {
  id: string;
  score_component_id: string;
  score: number;
  weight: number;
  attempt: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectAggregate {
  key: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  subject_credit: number;
  academic_year: string;
  semester: number | null;
  academic_term_id: string;
  official_mid: ScorePoint[];
  official_final: ScorePoint[];
  retake_mid: ScorePoint[];
  retake_final: ScorePoint[];
}

export interface SubjectOption {
  id: string;
  name: string;
}

export interface ScoreTableRow {
  key: string;
  index: number;
  student_id?: string;
  subject_id?: string;
  academic_term_id?: string;
  subject_code: string;
  subject_name: string;
  score_mode?: "official" | "retake";
  exam1Id?: string | null;
  exam1ScoreComponentId?: string | null;
  exam2Id?: string | null;
  exam2ScoreComponentId?: string | null;
  exam3Id?: string | null;
  exam3ScoreComponentId?: string | null;
  recheck1Id?: string | null;
  recheck1ScoreComponentId?: string | null;
  recheck2Id?: string | null;
  recheck2ScoreComponentId?: string | null;
  recheck3Id?: string | null;
  recheck3ScoreComponentId?: string | null;
  credits: number;
  weight: number;
  exam1: number | null;
  exam2: number | null;
  exam3: number | null;
  recheck1: number | null;
  recheck2: number | null;
  recheck3: number | null;
  avg10: number | null;
  avg4: number | null;
  grade: string;
  note: string;
}

export type ScoreTableRowWithAverages = ScoreTableRow & {
  avg10: number;
  avg4: number;
};

export interface ScoresTableProps {
  rows: ScoreTableRow[];
  editable?: boolean;
  onEditRow?: (row: ScoreTableRow) => void;
}

export interface ScoreScaleResult {
  avg4: number;
  letter: string;
}

export interface ScoreScaleThreshold {
  min: number;
  avg4: number;
  letter: string;
}

export interface RankingThreshold {
  min: number;
  label: string;
}

export interface StudentTotalScoreData {
  student_code: string;
  name: string;
  grade4: string;
  grade10: string;
  gpa4: number;
  accumulated_gpa4: number;
  accumulated_gpa10: number;
  accumulated_credits: number;
  studied_credits: number;
}

export interface StudentTotalScoreProps {
  summary?: StudentTotalScoreData;
}

export const RANKING = {
  EXCELLENT: "Xuất sắc",
  GOOD: "Giỏi",
  FAIR: "Khá",
  AVERAGE: "Trung bình",
  POOR: "Yếu"
};

export const LETTER_GRADE = {
  A: "A",
  B_PLUS: "B+",
  B: "B",
  C_PLUS: "C+",
  C: "C",
  D_PLUS: "D+",
  D: "D",
  F: "F"
};

export const SCORE_TYPE_OFFICIAL = "OFFICIAL";
export const SCORE_TYPE_RETAKE = "RETAKE";

export const COMPONENT_TYPE_MIDDLE = "MIDDLE";
export const COMPONENT_TYPE_FINAL = "FINAL";
export const COMPONENT_TYPE_OTHER = "OTHER";

export const COMPONENT_TYPE_MIDDLE_ALIASES = [
  COMPONENT_TYPE_MIDDLE,
  "D1",
  "D2",
  "BT",
  "TT",
  "THL",
  "CC",
  "BTL",
  "BTC",
  "GPH",
  "TH/TN",
];

export const COMPONENT_TYPE_FINAL_ALIASES = [
  COMPONENT_TYPE_FINAL,
];

export const COMPONENT_TYPE_OTHER_ALIASES = [
  COMPONENT_TYPE_OTHER,
];
