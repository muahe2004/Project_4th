import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

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
  return (
    <Box className="grades-flex">
      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-semester-label">
          Học kỳ
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-semester-label"
          label="Học kỳ"
          value={semesterFilter}
          onChange={onSemesterChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>Tất cả</em>
          </MenuItem>
          {semesterOptions.map((semester) => (
            <MenuItem key={semester} value={String(semester)}>
              {`Kỳ ${semester}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-academic-year-label">
          Năm học
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-academic-year-label"
          label="Năm học"
          value={academicYearFilter}
          onChange={onAcademicYearChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>Tất cả</em>
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
          Ngành học
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-major-label"
          label="Ngành học"
          value=""
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>Chưa hỗ trợ</em>
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-subject-label">
          Học phần
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-subject-label"
          label="Học phần"
          value={subjectFilter}
          onChange={onSubjectChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>Tất cả</em>
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
