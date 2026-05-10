import { useMemo } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

import { useGetScoreByStudentID } from "../../grades/apis/getScoreByStudentID";
import ScoresTable from "../../grades/components/ScoresTable";
import StudentTotalScore from "../../grades/components/StudentTotalScore";
import {
  COMPONENT_TYPE_FINAL_ALIASES,
  COMPONENT_TYPE_MIDDLE_ALIASES,
  COMPONENT_TYPE_OTHER_ALIASES,
  LETTER_GRADE,
  RANKING,
  SCORE_TYPE_OFFICIAL,
  SCORE_TYPE_RETAKE,
} from "../../grades/types";
import type {
  RankingThreshold,
  ScorePoint,
  ScoreScaleResult,
  ScoreScaleThreshold,
  ScoreTableRow,
  ScoreTableRowWithAverages,
  StudentScoreItemResponse,
  StudentTotalScoreData,
  SubjectAggregate,
} from "../../grades/types";

import "./styles/ScoreDetails.css";

const MAX_MIDTERM_COMPONENTS = 2;
const WEIGHT_PERCENT_DIVISOR = 100;
const MIN_WEIGHT = 0;
const PASSING_SCORE_10 = 4;
const ROUNDING_DECIMALS = 2;
const LOADING_SPINNER_SIZE = 28;

const SCORE_SCALE_THRESHOLDS: ScoreScaleThreshold[] = [
  { min: 8.5, avg4: 4.0, letter: LETTER_GRADE.A },
  { min: 8.0, avg4: 3.5, letter: LETTER_GRADE.B_PLUS },
  { min: 7.0, avg4: 3.0, letter: LETTER_GRADE.B },
  { min: 6.5, avg4: 2.5, letter: LETTER_GRADE.C_PLUS },
  { min: 5.5, avg4: 2.0, letter: LETTER_GRADE.C },
  { min: 5.0, avg4: 1.5, letter: LETTER_GRADE.D_PLUS },
  { min: 4.0, avg4: 1.0, letter: LETTER_GRADE.D },
];

const GPA4_RANKING_THRESHOLDS: RankingThreshold[] = [
  { min: 3.6, label: RANKING.EXCELLENT },
  { min: 3.2, label: RANKING.GOOD },
  { min: 2.5, label: RANKING.FAIR },
  { min: 2.0, label: RANKING.AVERAGE },
];

const GPA10_RANKING_THRESHOLDS: RankingThreshold[] = [
  { min: 9.0, label: RANKING.EXCELLENT },
  { min: 8.0, label: RANKING.GOOD },
  { min: 6.5, label: RANKING.FAIR },
  { min: 5.0, label: RANKING.AVERAGE },
];

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").toUpperCase().trim();
}

function isRetakeScore(item: StudentScoreItemResponse): boolean {
  const scoreType = normalizeText(item.score_type);
  if (scoreType === SCORE_TYPE_RETAKE) return true;
  if (scoreType === SCORE_TYPE_OFFICIAL) return false;
  return item.attempt > 1;
}

function isMidtermComponent(componentType: string): boolean {
  return COMPONENT_TYPE_MIDDLE_ALIASES.includes(normalizeText(componentType));
}
function isFinalComponent(componentType: string): boolean {
  return COMPONENT_TYPE_FINAL_ALIASES.includes(normalizeText(componentType));
}
function isOtherComponent(componentType: string): boolean {
  return COMPONENT_TYPE_OTHER_ALIASES.includes(normalizeText(componentType));
}
function toNormalizedWeight(weight: number): number {
  if (weight > 1) return weight / WEIGHT_PERCENT_DIVISOR;
  if (weight < MIN_WEIGHT) return MIN_WEIGHT;
  return weight;
}
function sortScorePoints(points: ScorePoint[]): ScorePoint[] {
  return [...points].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}
function pickLatestScorePoint(points: ScorePoint[]): ScorePoint | null {
  if (points.length === 0) return null;
  return [...points].sort((a, b) => {
    if (a.attempt !== b.attempt) return b.attempt - a.attempt;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  })[0];
}
function score10ToScale(score10: number): ScoreScaleResult {
  const matchedThreshold = SCORE_SCALE_THRESHOLDS.find((threshold) => score10 >= threshold.min);
  return matchedThreshold ? { avg4: matchedThreshold.avg4, letter: matchedThreshold.letter } : { avg4: 0, letter: LETTER_GRADE.F };
}
function classifyGpa4(gpa4: number): string {
  return GPA4_RANKING_THRESHOLDS.find((threshold) => gpa4 >= threshold.min)?.label ?? RANKING.POOR;
}
function classifyGpa10(gpa10: number): string {
  return GPA10_RANKING_THRESHOLDS.find((threshold) => gpa10 >= threshold.min)?.label ?? RANKING.POOR;
}
function getAcademicYearStart(academicYear: string): number {
  const parsed = Number(academicYear.split("-")[0]);
  return Number.isNaN(parsed) ? 0 : parsed;
}
function getScoreMode(subject: SubjectAggregate): "official" | "retake" {
  const hasRetakeScore =
    subject.retake_mid.length > 0 ||
    subject.retake_final.length > 0 ||
    subject.retake_mid.some((point) => point.attempt > 1) ||
    subject.retake_final.some((point) => point.attempt > 1);
  return hasRetakeScore ? "retake" : "official";
}

export function TeacherScoreDetails() {
  const location = useLocation();
  const state = location.state as
    | { studentId?: string; studentCode?: string; studentName?: string; classId?: string | null; classCode?: string | null; className?: string | null }
    | undefined;

  const { data: scoreData, isLoading, isError, error } = useGetScoreByStudentID(state?.studentId, {}, Boolean(state?.studentId));

  const studentInfo = scoreData?.student_info;

  const aggregatedSubjects = useMemo(() => {
    const map = new Map<string, SubjectAggregate>();
    const items = scoreData?.scores.items ?? [];

    items.forEach((item) => {
      if (item.status && normalizeText(item.status) !== "ACTIVE") return;
      const key = `${item.subject_id}-${item.academic_term_id}`;
      const scorePoint: ScorePoint = {
        id: item.id,
        score_component_id: item.score_component.id,
        score: item.score,
        weight: item.score_component.weight,
        attempt: item.attempt,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
      if (!map.has(key)) {
        map.set(key, {
          key,
          subject_id: item.subject_id,
          subject_code: item.subject_code,
          subject_name: item.subject_name,
          subject_credit: item.subject_credit,
          academic_year: item.academic_year,
          semester: item.semester ?? null,
          academic_term_id: item.academic_term_id,
          official_mid: [],
          official_final: [],
          retake_mid: [],
          retake_final: [],
        });
      }
      const target = map.get(key);
      if (!target) return;
      const isRetake = isRetakeScore(item);
      const isFinal = isFinalComponent(item.score_component.component_type);
      const isMid = isMidtermComponent(item.score_component.component_type);
      const isOther = isOtherComponent(item.score_component.component_type);
      if (isRetake) {
        if (isFinal) target.retake_final.push(scorePoint);
        else if (isMid) target.retake_mid.push(scorePoint);
        else if (isOther && target.retake_mid.length < MAX_MIDTERM_COMPONENTS) target.retake_mid.push(scorePoint);
        else target.retake_final.push(scorePoint);
      } else if (isFinal) target.official_final.push(scorePoint);
      else if (isMid) target.official_mid.push(scorePoint);
      else if (isOther && target.official_mid.length < MAX_MIDTERM_COMPONENTS) target.official_mid.push(scorePoint);
      else target.official_final.push(scorePoint);
    });

    return [...map.values()].sort((left, right) => {
      const yearCompare = getAcademicYearStart(right.academic_year) - getAcademicYearStart(left.academic_year);
      if (yearCompare !== 0) return yearCompare;
      const leftSemester = left.semester ?? 0;
      const rightSemester = right.semester ?? 0;
      if (rightSemester !== leftSemester) return rightSemester - leftSemester;
      return left.subject_name.localeCompare(right.subject_name, "vi");
    });
  }, [scoreData?.scores.items]);

  const scoreRows = useMemo<ScoreTableRow[]>(() => {
    if (!studentInfo) return [];

    return aggregatedSubjects.map((subject, index) => {
      const officialMid = sortScorePoints(subject.official_mid).slice(0, MAX_MIDTERM_COMPONENTS);
      const retakeMid = sortScorePoints(subject.retake_mid).slice(0, MAX_MIDTERM_COMPONENTS);
      const officialFinal = pickLatestScorePoint(subject.official_final);
      const retakeFinal = pickLatestScorePoint(subject.retake_final);
      const selectedMid1 = retakeMid[0] ?? officialMid[0] ?? null;
      const selectedMid2 = retakeMid[1] ?? officialMid[1] ?? null;
      const selectedFinal = retakeFinal ?? officialFinal ?? null;
      const hasFinalScore = selectedFinal !== null;

      let normalizedWeightSum = 0;
      let roundedAvg10: number | null = null;
      let avg4: number | null = null;
      let letter = "-";

      if (hasFinalScore) {
        const selectedForAverage = [selectedMid1, selectedMid2, selectedFinal].filter(
          (point): point is ScorePoint => point !== null && point.score !== null
        );
        normalizedWeightSum = selectedForAverage.reduce((sum, point) => sum + toNormalizedWeight(point.weight), 0);
        let avg10 = 0;
        if (selectedForAverage.length > 0 && normalizedWeightSum > 0) {
          const weightedTotal = selectedForAverage.reduce((sum, point) => sum + point.score * toNormalizedWeight(point.weight), 0);
          avg10 = weightedTotal / normalizedWeightSum;
        } else if (selectedForAverage.length > 0) {
          avg10 = selectedForAverage.reduce((sum, point) => sum + point.score, 0) / selectedForAverage.length;
        }
        roundedAvg10 = Number(avg10.toFixed(ROUNDING_DECIMALS));
        const gradeInfo = score10ToScale(roundedAvg10);
        avg4 = gradeInfo.avg4;
        letter = gradeInfo.letter;
      }

      return {
        key: subject.key,
        index: index + 1,
        student_id: studentInfo.id,
        subject_id: subject.subject_id,
        academic_term_id: subject.academic_term_id,
        subject_code: subject.subject_code,
        subject_name: subject.subject_name,
        score_mode: getScoreMode(subject),
        exam1Id: officialMid[0]?.id ?? null,
        exam1ScoreComponentId: officialMid[0]?.score_component_id ?? null,
        exam2Id: officialMid[1]?.id ?? null,
        exam2ScoreComponentId: officialMid[1]?.score_component_id ?? null,
        exam3Id: officialFinal?.id ?? null,
        exam3ScoreComponentId: officialFinal?.score_component_id ?? null,
        recheck1Id: retakeMid[0]?.id ?? null,
        recheck1ScoreComponentId: retakeMid[0]?.score_component_id ?? null,
        recheck2Id: retakeMid[1]?.id ?? null,
        recheck2ScoreComponentId: retakeMid[1]?.score_component_id ?? null,
        recheck3Id: retakeFinal?.id ?? null,
        recheck3ScoreComponentId: retakeFinal?.score_component_id ?? null,
        credits: subject.subject_credit,
        weight: Number(normalizedWeightSum.toFixed(ROUNDING_DECIMALS)),
        exam1: officialMid[0]?.score ?? null,
        exam2: officialMid[1]?.score ?? null,
        exam3: officialFinal?.score ?? null,
        recheck1: retakeMid[0]?.score ?? null,
        recheck2: retakeMid[1]?.score ?? null,
        recheck3: retakeFinal?.score ?? null,
        avg10: roundedAvg10,
        avg4,
        grade: letter,
        note: hasFinalScore ? "" : "Chưa có điểm thi",
      };
    });
  }, [aggregatedSubjects, studentInfo]);

  const summaryData = useMemo<StudentTotalScoreData | undefined>(() => {
    if (!studentInfo) return undefined;
    const rowsForGpa = scoreRows.filter((row): row is ScoreTableRowWithAverages => row.avg10 !== null && row.avg4 !== null);
    if (rowsForGpa.length === 0) return undefined;
    const studiedCredits = scoreRows.reduce((sum, row) => sum + row.credits, 0);
    const gpaCredits = rowsForGpa.reduce((sum, row) => sum + row.credits, 0);
    const accumulatedCredits = rowsForGpa.reduce((sum, row) => (row.avg10 >= PASSING_SCORE_10 ? sum + row.credits : sum), 0);
    const gpa10 = gpaCredits > 0 ? rowsForGpa.reduce((sum, row) => sum + row.avg10 * row.credits, 0) / gpaCredits : 0;
    const gpa4 = gpaCredits > 0 ? rowsForGpa.reduce((sum, row) => sum + row.avg4 * row.credits, 0) / gpaCredits : 0;
    const roundedGpa10 = Number(gpa10.toFixed(ROUNDING_DECIMALS));
    const roundedGpa4 = Number(gpa4.toFixed(ROUNDING_DECIMALS));
    return {
      student_code: studentInfo.student_code,
      name: studentInfo.name,
      grade4: classifyGpa4(roundedGpa4),
      grade10: classifyGpa10(roundedGpa10),
      gpa4: roundedGpa4,
      accumulated_gpa4: roundedGpa4,
      accumulated_gpa10: roundedGpa10,
      accumulated_credits: accumulatedCredits,
      studied_credits: studiedCredits,
    };
  }, [studentInfo, scoreRows]);

  if (!state?.studentId) {
    return <main className="admin-main-container"><Alert severity="warning">Không tìm thấy sinh viên để xem chi tiết điểm.</Alert></main>;
  }

  return (
    <main className="admin-main-container">
      <Typography className="primary-title">
        {state.studentCode ?? "-"} - {state.studentName ?? "SCORE DETAILS"}
      </Typography>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={LOADING_SPINNER_SIZE} />
        </Box>
      ) : isError ? (
        <Alert severity="error">{(error as any)?.response?.data?.detail ?? "Lấy dữ liệu điểm thất bại"}</Alert>
      ) : (
        <>
          <Box sx={{ mt: 2 }}>
            <StudentTotalScore summary={summaryData} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <ScoresTable rows={scoreRows} editable={false} />
          </Box>
        </>
      )}
    </main>
  );
}

export default TeacherScoreDetails;
