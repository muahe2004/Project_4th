import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  COMPONENT_TYPE_FINAL,
  COMPONENT_TYPE_MIDDLE,
  COMPONENT_TYPE_OTHER,
  LETTER_GRADE,
  SCORE_TYPE_OFFICIAL,
  SCORE_TYPE_RETAKE,
} from "../../grades/types";
import type { IStudentScoreByClassSubjectItem, IStudentScoreItemResponse } from "../types";

import "../../grades/components/styles/studentTableScore.css";

interface ListStudentScoreTableProps {
  rows?: IStudentScoreByClassSubjectItem[];
}

type ScorePoint = {
  id: string;
  score: number;
  score_component_id: string;
  weight: number;
  attempt: number;
  created_at: string;
  updated_at: string;
};

type StudentScoreRow = {
  officialMid: ScorePoint[];
  officialFinal: ScorePoint[];
  retakeMid: ScorePoint[];
  retakeFinal: ScorePoint[];
};

const MAX_MIDTERM_COMPONENTS = 2;
const WEIGHT_PERCENT_DIVISOR = 100;
const MIN_WEIGHT = 0;
const ROUNDING_DECIMALS = 2;
const SCORE_SCALE_THRESHOLDS = [
  { min: 8.5, avg4: 4.0, letter: LETTER_GRADE.A },
  { min: 8.0, avg4: 3.5, letter: LETTER_GRADE.B_PLUS },
  { min: 7.0, avg4: 3.0, letter: LETTER_GRADE.B },
  { min: 6.5, avg4: 2.5, letter: LETTER_GRADE.C_PLUS },
  { min: 5.5, avg4: 2.0, letter: LETTER_GRADE.C },
  { min: 5.0, avg4: 1.5, letter: LETTER_GRADE.D_PLUS },
  { min: 4.0, avg4: 1.0, letter: LETTER_GRADE.D },
];

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").toUpperCase().trim();
}

function isRetakeScore(item: IStudentScoreItemResponse): boolean {
  const scoreType = normalizeText(item.score_type);
  if (scoreType === SCORE_TYPE_RETAKE) {
    return true;
  }
  if (scoreType === SCORE_TYPE_OFFICIAL) {
    return false;
  }
  return item.attempt > 1;
}

function isMidtermComponent(componentType: string): boolean {
  return normalizeText(componentType) === COMPONENT_TYPE_MIDDLE;
}

function isFinalComponent(componentType: string): boolean {
  return normalizeText(componentType) === COMPONENT_TYPE_FINAL;
}

function isOtherComponent(componentType: string): boolean {
  return normalizeText(componentType) === COMPONENT_TYPE_OTHER;
}

function toNormalizedWeight(weight: number): number {
  if (weight > 1) {
    return weight / WEIGHT_PERCENT_DIVISOR;
  }
  if (weight < MIN_WEIGHT) {
    return MIN_WEIGHT;
  }
  return weight;
}

function formatScore(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

function sortScorePoints(points: ScorePoint[]): ScorePoint[] {
  return [...points].sort((left, right) => {
    const leftTime = new Date(left.created_at).getTime();
    const rightTime = new Date(right.created_at).getTime();
    return leftTime - rightTime;
  });
}

function pickLatestScorePoint(points: ScorePoint[]): ScorePoint | null {
  if (points.length === 0) {
    return null;
  }

  return [...points].sort((left, right) => {
    if (left.attempt !== right.attempt) {
      return right.attempt - left.attempt;
    }
    const leftTime = new Date(left.updated_at).getTime();
    const rightTime = new Date(right.updated_at).getTime();
    return rightTime - leftTime;
  })[0];
}

function score10ToScale(score10: number): { avg4: number; letter: string } {
  const matchedThreshold = SCORE_SCALE_THRESHOLDS.find((threshold) => score10 >= threshold.min);
  if (matchedThreshold) {
    return { avg4: matchedThreshold.avg4, letter: matchedThreshold.letter };
  }

  return { avg4: 0, letter: LETTER_GRADE.F };
}

function buildStudentScoreRow(scores: IStudentScoreItemResponse[]): StudentScoreRow {
  const grouped: StudentScoreRow = {
    officialMid: [],
    officialFinal: [],
    retakeMid: [],
    retakeFinal: [],
  };

  scores.forEach((item) => {
    const scorePoint: ScorePoint = {
      id: item.id,
      score: item.score,
      score_component_id: item.score_component.id,
      weight: item.score_component.weight,
      attempt: item.attempt,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };

    const isRetake = isRetakeScore(item);
    const isFinal = isFinalComponent(item.score_component.component_type);
    const isMid = isMidtermComponent(item.score_component.component_type);
    const isOther = isOtherComponent(item.score_component.component_type);

    if (isRetake) {
      if (isFinal) {
        grouped.retakeFinal.push(scorePoint);
      } else if (isMid) {
        grouped.retakeMid.push(scorePoint);
      } else if (isOther && grouped.retakeMid.length < MAX_MIDTERM_COMPONENTS) {
        grouped.retakeMid.push(scorePoint);
      } else {
        grouped.retakeFinal.push(scorePoint);
      }
    } else if (isFinal) {
      grouped.officialFinal.push(scorePoint);
    } else if (isMid) {
      grouped.officialMid.push(scorePoint);
    } else if (isOther && grouped.officialMid.length < MAX_MIDTERM_COMPONENTS) {
      grouped.officialMid.push(scorePoint);
    } else {
      grouped.officialFinal.push(scorePoint);
    }
  });

  return grouped;
}

function calculateAverage(points: Array<ScorePoint | null>): {
  avg10: number | null;
  avg4: number | null;
  grade: string;
  weight: number;
} {
  const selected = points.filter((point): point is ScorePoint => point !== null);
  if (selected.length === 0) {
    return { avg10: null, avg4: null, grade: "-", weight: 0 };
  }

  const normalizedWeightSum = selected.reduce((sum, point) => sum + toNormalizedWeight(point.weight), 0);
  let avg10 = 0;

  if (normalizedWeightSum > 0) {
    const weightedTotal = selected.reduce(
      (sum, point) => sum + point.score * toNormalizedWeight(point.weight),
      0
    );
    avg10 = weightedTotal / normalizedWeightSum;
  } else {
    avg10 = selected.reduce((sum, point) => sum + point.score, 0) / selected.length;
  }

  const roundedAvg10 = Number(avg10.toFixed(ROUNDING_DECIMALS));
  const gradeInfo = score10ToScale(roundedAvg10);

  return {
    avg10: roundedAvg10,
    avg4: gradeInfo.avg4,
    grade: gradeInfo.letter,
    weight: Number(normalizedWeightSum.toFixed(ROUNDING_DECIMALS)),
  };
}

export function ListStudentScoreTable({ rows }: ListStudentScoreTableProps) {
  return (
    <TableContainer className="primary-table-container" component={Paper}>
      <Table className="primary-table" aria-label="class subject student score table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" rowSpan={2} align="center">STT</TableCell>
            <TableCell className="primary-thead__cell" rowSpan={2} align="left">MSSV</TableCell>
            <TableCell className="primary-thead__cell" rowSpan={2} align="left">Họ và tên</TableCell>
            <TableCell className="primary-thead__cell" colSpan={3} align="center">Điểm thành phần</TableCell>
            <TableCell className="primary-thead__cell" colSpan={3} align="center">Điểm thi lại</TableCell>
            <TableCell className="primary-thead__cell" colSpan={3} align="center">Trung bình môn</TableCell>
          </TableRow>
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">Đ1</TableCell>
            <TableCell className="primary-thead__cell" align="center">Đ2</TableCell>
            <TableCell className="primary-thead__cell" align="center">Thi</TableCell>
            <TableCell className="primary-thead__cell" align="center">Đ1</TableCell>
            <TableCell className="primary-thead__cell" align="center">Đ2</TableCell>
            <TableCell className="primary-thead__cell" align="center">Thi</TableCell>
            <TableCell className="primary-thead__cell" align="center">Hệ 10</TableCell>
            <TableCell className="primary-thead__cell" align="center">Hệ 4</TableCell>
            <TableCell className="primary-thead__cell" align="center">Điểm chữ</TableCell>
          </TableRow>
        </TableHead>

        <TableBody className="primary-tbody">
          {(rows ?? []).length === 0 ? (
            <TableRow className="primary-trow">
              <TableCell className="primary-tcell" colSpan={12} align="center">
                Không có dữ liệu điểm
              </TableCell>
            </TableRow>
          ) : (
            (rows ?? []).map((row, index) => {
              const grouped = buildStudentScoreRow(row.scores);

              const officialMid = sortScorePoints(grouped.officialMid).slice(0, MAX_MIDTERM_COMPONENTS);
              const retakeMid = sortScorePoints(grouped.retakeMid).slice(0, MAX_MIDTERM_COMPONENTS);
              const officialFinal = pickLatestScorePoint(grouped.officialFinal);
              const retakeFinal = pickLatestScorePoint(grouped.retakeFinal);

              const selectedMid1 = retakeMid[0] ?? officialMid[0] ?? null;
              const selectedMid2 = retakeMid[1] ?? officialMid[1] ?? null;
              const selectedFinal = retakeFinal ?? officialFinal ?? null;

              const avg = calculateAverage([selectedMid1, selectedMid2, selectedFinal]);

              return (
                <TableRow key={row.student_info.id} className="primary-trow">
                  <TableCell className="primary-tcell" align="center">{index + 1}</TableCell>
                  <TableCell className="primary-tcell" align="left">
                    {row.student_info.student_code}
                  </TableCell>
                  <TableCell className="primary-tcell" align="left">
                    {row.student_info.name}
                  </TableCell>

                  <TableCell className="primary-tcell" align="center">
                    {formatScore(officialMid[0]?.score)}
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    {formatScore(officialMid[1]?.score)}
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    {formatScore(officialFinal?.score)}
                  </TableCell>

                  <TableCell className="primary-tcell" align="center">
                    {formatScore(retakeMid[0]?.score)}
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    {formatScore(retakeMid[1]?.score)}
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    {formatScore(retakeFinal?.score)}
                  </TableCell>

                  <TableCell className="primary-tcell" align="center">
                    {formatScore(avg.avg10)}
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    {formatScore(avg.avg4)}
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    {avg.grade}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ListStudentScoreTable;
