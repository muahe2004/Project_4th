import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import { useAuthStore } from "../../../stores/useAuthStore";
import { useGetScoreByStudentID } from "../apis/getScoreByStudentID";
import GradeControls from "../components/GradeControls";
import StudentTotalScore from "../components/StudentTotalScore";
import ScoresTable from "../components/ScoresTable";
import {
  COMPONENT_TYPE_FINAL,
  COMPONENT_TYPE_MIDDLE,
  COMPONENT_TYPE_OTHER,
  LETTER_GRADE,
  RANKING,
  SCORE_TYPE_OFFICIAL,
  SCORE_TYPE_RETAKE,
} from "../types";
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
  SubjectOption,
} from "../types";

import "./styles/Grades.css";

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

function normalizeText(value: string): string {
  return value.toUpperCase().trim();
}

function isRetakeScore(item: StudentScoreItemResponse): boolean {
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

function score10ToScale(score10: number): ScoreScaleResult {
  const matchedThreshold = SCORE_SCALE_THRESHOLDS.find((threshold) => score10 >= threshold.min);
  if (matchedThreshold) {
    return { avg4: matchedThreshold.avg4, letter: matchedThreshold.letter };
  }

  return { avg4: 0, letter: LETTER_GRADE.F };
}

function classifyGpa4(gpa4: number): string {
  const matchedThreshold = GPA4_RANKING_THRESHOLDS.find((threshold) => gpa4 >= threshold.min);
  return matchedThreshold?.label ?? RANKING.POOR;
}

function classifyGpa10(gpa10: number): string {
  const matchedThreshold = GPA10_RANKING_THRESHOLDS.find((threshold) => gpa10 >= threshold.min);
  return matchedThreshold?.label ?? RANKING.POOR;
}

function getAcademicYearStart(academicYear: string): number {
  const firstPart = academicYear.split("-")[0];
  const parsed = Number(firstPart);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function GradesPage() {
  const user = useAuthStore((state) => state.user);
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("");
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");

  const {
    data: scoreData,
    isLoading,
    isError,
    error,
  } = useGetScoreByStudentID(user?.id, {}, Boolean(user?.id));

  const aggregatedSubjects = useMemo(() => {
    const map = new Map<string, SubjectAggregate>();
    const items = scoreData?.scores.items ?? [];

    items.forEach((item) => {
      if (item.status && normalizeText(item.status) !== "ACTIVE") {
        return;
      }

      const key = `${item.subject_id}-${item.academic_term_id}`;
      const existing = map.get(key);

      const scorePoint: ScorePoint = {
        score: item.score,
        weight: item.score_component.weight,
        attempt: item.attempt,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      if (!existing) {
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
      if (!target) {
        return;
      }

      const isRetake = isRetakeScore(item);
      const isFinal = isFinalComponent(item.score_component.component_type);
      const isMid = isMidtermComponent(item.score_component.component_type);
      const isOther = isOtherComponent(item.score_component.component_type);

      if (isRetake) {
        if (isFinal) {
          target.retake_final.push(scorePoint);
        } else if (isMid) {
          target.retake_mid.push(scorePoint);
        } else if (isOther && target.retake_mid.length < MAX_MIDTERM_COMPONENTS) {
          target.retake_mid.push(scorePoint);
        } else {
          target.retake_final.push(scorePoint);
        }
      } else if (isFinal) {
        target.official_final.push(scorePoint);
      } else if (isMid) {
        target.official_mid.push(scorePoint);
      } else if (isOther && target.official_mid.length < MAX_MIDTERM_COMPONENTS) {
        target.official_mid.push(scorePoint);
      } else {
        target.official_final.push(scorePoint);
      }
    });

    return [...map.values()].sort((left, right) => {
      const yearCompare =
        getAcademicYearStart(right.academic_year) - getAcademicYearStart(left.academic_year);
      if (yearCompare !== 0) {
        return yearCompare;
      }

      const leftSemester = left.semester ?? 0;
      const rightSemester = right.semester ?? 0;
      if (rightSemester !== leftSemester) {
        return rightSemester - leftSemester;
      }

      return left.subject_name.localeCompare(right.subject_name, "vi");
    });
  }, [scoreData?.scores.items]);

  const academicYearOptions = useMemo(() => {
    const unique = new Set(aggregatedSubjects.map((item) => item.academic_year));
    return [...unique].sort((left, right) => getAcademicYearStart(right) - getAcademicYearStart(left));
  }, [aggregatedSubjects]);

  const semesterOptions = useMemo(() => {
    const semesters = aggregatedSubjects
      .filter((item) => !academicYearFilter || item.academic_year === academicYearFilter)
      .map((item) => item.semester)
      .filter((semester): semester is number => semester !== null);

    return [...new Set(semesters)].sort((left, right) => left - right);
  }, [aggregatedSubjects, academicYearFilter]);

  const subjectOptions = useMemo(() => {
    const map = new Map<string, SubjectOption>();
    aggregatedSubjects
      .filter((item) => !academicYearFilter || item.academic_year === academicYearFilter)
      .filter((item) => !semesterFilter || String(item.semester ?? "") === semesterFilter)
      .forEach((item) => {
        map.set(item.subject_id, { id: item.subject_id, name: item.subject_name });
      });

    return [...map.values()].sort((left, right) => left.name.localeCompare(right.name, "vi"));
  }, [aggregatedSubjects, academicYearFilter, semesterFilter]);

  const filteredSubjects = useMemo(() => {
    return aggregatedSubjects
      .filter((item) => !academicYearFilter || item.academic_year === academicYearFilter)
      .filter((item) => !semesterFilter || String(item.semester ?? "") === semesterFilter)
      .filter((item) => !subjectFilter || item.subject_id === subjectFilter);
  }, [aggregatedSubjects, academicYearFilter, semesterFilter, subjectFilter]);

  const scoreRows = useMemo<ScoreTableRow[]>(() => {
    return filteredSubjects.map((subject, index) => {
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
          (point): point is ScorePoint => point !== null
        );

        normalizedWeightSum = selectedForAverage.reduce(
          (sum, point) => sum + toNormalizedWeight(point.weight),
          0
        );

        let avg10 = 0;
        if (selectedForAverage.length > 0 && normalizedWeightSum > 0) {
          const weightedTotal = selectedForAverage.reduce(
            (sum, point) => sum + point.score * toNormalizedWeight(point.weight),
            0
          );
          avg10 = weightedTotal / normalizedWeightSum;
        } else if (selectedForAverage.length > 0) {
          const rawTotal = selectedForAverage.reduce((sum, point) => sum + point.score, 0);
          avg10 = rawTotal / selectedForAverage.length;
        }

        roundedAvg10 = Number(avg10.toFixed(ROUNDING_DECIMALS));
        const gradeInfo = score10ToScale(roundedAvg10);
        avg4 = gradeInfo.avg4;
        letter = gradeInfo.letter;
      }

      return {
        key: subject.key,
        index: index + 1,
        subject_code: subject.subject_code,
        subject_name: subject.subject_name,
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
  }, [filteredSubjects]);

  const summaryData = useMemo<StudentTotalScoreData | undefined>(() => {
    if (!scoreData?.student_info) {
      return undefined;
    }

    const studiedCredits = scoreRows.reduce((sum, row) => sum + row.credits, 0);
    const rowsForGpa = scoreRows.filter(
      (row): row is ScoreTableRowWithAverages =>
        row.avg10 !== null && row.avg4 !== null
    );
    const gpaCredits = rowsForGpa.reduce((sum, row) => sum + row.credits, 0);

    const accumulatedCredits = rowsForGpa.reduce((sum, row) => {
      if (row.avg10 >= PASSING_SCORE_10) {
        return sum + row.credits;
      }
      return sum;
    }, 0);

    const gpa10 =
      gpaCredits > 0
        ? rowsForGpa.reduce((sum, row) => sum + row.avg10 * row.credits, 0) / gpaCredits
        : 0;
    const gpa4 =
      gpaCredits > 0
        ? rowsForGpa.reduce((sum, row) => sum + row.avg4 * row.credits, 0) / gpaCredits
        : 0;

    const roundedGpa10 = Number(gpa10.toFixed(ROUNDING_DECIMALS));
    const roundedGpa4 = Number(gpa4.toFixed(ROUNDING_DECIMALS));

    return {
      student_code: scoreData.student_info.student_code,
      name: scoreData.student_info.name,
      grade4: classifyGpa4(roundedGpa4),
      grade10: classifyGpa10(roundedGpa10),
      gpa4: roundedGpa4,
      accumulated_gpa4: roundedGpa4,
      accumulated_gpa10: roundedGpa10,
      accumulated_credits: accumulatedCredits,
      studied_credits: studiedCredits,
    };
  }, [scoreData?.student_info, scoreRows]);

  const handleAcademicYearChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setAcademicYearFilter(value);
    setSemesterFilter("");
    setSubjectFilter("");
  };

  const handleSemesterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSemesterFilter(value);
    setSubjectFilter("");
  };

  const handleSubjectChange = (event: SelectChangeEvent<string>) => {
    setSubjectFilter(event.target.value);
  };

  if (!user?.id) {
    return (
      <main className="grades">
        <Typography className="primary-title">KẾT QUẢ HỌC TẬP</Typography>
        <Alert severity="warning">Không tìm thấy thông tin sinh viên đăng nhập.</Alert>
      </main>
    );
  }

  return (
    <main className="grades">
      <Typography className="primary-title">KẾT QUẢ HỌC TẬP</Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={LOADING_SPINNER_SIZE} />
        </Box>
      ) : isError ? (
        <Alert severity="error">{error?.response?.data?.detail ?? "Lấy dữ liệu điểm thất bại"}</Alert>
      ) : (
        <>
          <StudentTotalScore summary={summaryData} />

          <GradeControls
            semesterFilter={semesterFilter}
            academicYearFilter={academicYearFilter}
            subjectFilter={subjectFilter}
            semesterOptions={semesterOptions}
            academicYearOptions={academicYearOptions}
            subjectOptions={subjectOptions}
            onSemesterChange={handleSemesterChange}
            onAcademicYearChange={handleAcademicYearChange}
            onSubjectChange={handleSubjectChange}
          />

          <ScoresTable rows={scoreRows} />
        </>
      )}
    </main>
  );
}

export default GradesPage;
