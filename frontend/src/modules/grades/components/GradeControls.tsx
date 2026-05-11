import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";

import type { SubjectOption } from "../types";

interface GradeControlsProps {
  semesterFilter: string;
  academicYearFilter: string;
  subjectFilter: string;
  semesterOptions: number[];
  academicYearOptions: string[];
  subjectOptions: SubjectOption[];
  onSemesterChange: (event: SelectChangeEvent<string>) => void;
  onAcademicYearChange: (event: SelectChangeEvent<string>) => void;
  onSubjectChange: (event: SelectChangeEvent<string>) => void;
}

function GradeControls({
  semesterFilter,
  academicYearFilter,
  subjectFilter,
  semesterOptions,
  academicYearOptions,
  subjectOptions,
  onSemesterChange,
  onAcademicYearChange,
  onSubjectChange,
}: GradeControlsProps) {
  const { t } = useTranslation();
  return (
    <Box className="grades-flex">
      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-semester-label">
          {t("grades.filters.semester")}
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-semester-label"
          label={t("grades.filters.semester")}
          value={semesterFilter}
          onChange={onSemesterChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>{t("grades.common.all")}</em>
          </MenuItem>
          {semesterOptions.map((semester) => (
            <MenuItem key={semester} value={String(semester)}>
              {t("grades.filters.semesterLabel", { semester })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-academic-year-label">
          {t("grades.filters.academicYear")}
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-academic-year-label"
          label={t("grades.filters.academicYear")}
          value={academicYearFilter}
          onChange={onAcademicYearChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>{t("grades.common.all")}</em>
          </MenuItem>
          {academicYearOptions.map((academicYear) => (
            <MenuItem key={academicYear} value={academicYear}>
              {academicYear}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl className="grades-controller" disabled>
        <InputLabel className="select-primary__label" id="grades-major-label">
          {t("grades.filters.major")}
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-major-label"
          label={t("grades.filters.major")}
          value=""
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>{t("grades.common.notSupported")}</em>
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-subject-label">
          {t("grades.filters.subject")}
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-subject-label"
          label={t("grades.filters.subject")}
          value={subjectFilter}
          onChange={onSubjectChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>{t("grades.common.all")}</em>
          </MenuItem>
          {subjectOptions.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default GradeControls;
