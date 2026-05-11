import {
  Box,
  InputAdornment,
  FormControl,
  InputLabel,
  IconButton,
  MenuItem,
  TextField,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";

interface ManagementControlsProps {
  searchValue: string;
  semesterFilter: string;
  academicYearFilter: string;
  semesterOptions: number[];
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  onSemesterChange: (event: SelectChangeEvent<string>) => void;
  onAcademicYearChange: (event: SelectChangeEvent<string>) => void;
  academicYearOptions: string[];
}

function ManagementControls({
  searchValue,
  semesterFilter,
  academicYearFilter,
  semesterOptions,
  academicYearOptions,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onSemesterChange,
  onAcademicYearChange,
}: ManagementControlsProps) {
  const { t } = useTranslation();

  return (
    <Box className="grades-flex">
      <TextField
        variant="outlined"
        placeholder={t("teacherManagementScore.controls.searchPlaceholder")}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearchSubmit();
          }
        }}
        className="main-text__field search-engine__input"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {searchValue && (
                <IconButton onClick={onSearchClear} className="search-engine__icon" size="small">
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={onSearchSubmit} size="small" className="search-engine__icon">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-academic-year-label">
          {t("teacherManagementScore.controls.academicYear")}
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-academic-year-label"
          label={t("teacherManagementScore.controls.academicYear")}
          value={academicYearFilter}
          onChange={onAcademicYearChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>{t("teacherManagementScore.controls.all")}</em>
          </MenuItem>
          {academicYearOptions.map((academicYear) => (
            <MenuItem key={academicYear} value={academicYear}>
              {academicYear}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl className="grades-controller">
        <InputLabel className="select-primary__label" id="grades-semester-label">
          {t("teacherManagementScore.controls.semester")}
        </InputLabel>
        <Select
          className="select-primary"
          labelId="grades-semester-label"
          label={t("teacherManagementScore.controls.semester")}
          value={semesterFilter}
          onChange={onSemesterChange}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">
            <em>{t("teacherManagementScore.controls.all")}</em>
          </MenuItem>
          {semesterOptions.map((semester) => (
            <MenuItem key={semester} value={String(semester)}>
              {t("teacherManagementScore.controls.semesterLabel", { semester })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default ManagementControls;
