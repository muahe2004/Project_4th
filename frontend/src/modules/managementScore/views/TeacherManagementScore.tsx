import { useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useGetTeachingClasses } from "../apis/getTeachingClasses";
import { useGetAdvisorClasses } from "../apis/getAdvisorClass";
import { useGetAcademicTerms } from "../apis/getAcademicTerms";
import AdvisorClass from "../components/AdvisorClass";
import ManagementControls from "../components/ManagementControls";
import TeachingClassTable from "../components/TeachingClassTable";

import "./styles/ManagementScore.css";

const DEFAULT_ROWS_PER_PAGE = 10;

function findAcademicTerm(
  academicTermGroups: Array<{
    academic_year: string;
    terms: Array<{
      id: string;
      semester: number | null;
      start_date: string;
      end_date: string;
      status?: string | null;
    }>;
  }>,
  academicYear: string,
  semester: string
) {
  if (!academicYear || !semester) {
    return null;
  }

  const selectedSemester = Number(semester);
  if (Number.isNaN(selectedSemester)) {
    return null;
  }

  return (
    academicTermGroups.find((group) => group.academic_year === academicYear)?.terms.find((term) => term.semester === selectedSemester) ?? null
  );
}

function isCurrentTerm(term: {
  start_date: string;
  end_date: string;
  status?: string | null;
}) {
  if ((term.status ?? "").toLowerCase() === "active") {
    return true;
  }

  const now = new Date();
  const startDate = new Date(term.start_date);
  const endDate = new Date(term.end_date);
  return startDate <= now && now <= endDate;
}

export function TeacherManagementScore() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const teacherId = user?.id;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [search, setSearch] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [academicTermId, setAcademicTermId] = useState("");

  const currentYear = new Date().getFullYear();
  const { data: academicTermGroups = [] } = useGetAcademicTerms(currentYear, {
    enabled: true,
  });

  const academicYearOptions = useMemo(
    () => academicTermGroups.map((group) => group.academic_year),
    [academicTermGroups]
  );
  const currentTerm = useMemo(() => {
    for (const group of academicTermGroups) {
      const matchedTerm = group.terms.find(isCurrentTerm);
      if (matchedTerm) {
        return {
          academic_year: group.academic_year,
          term: matchedTerm,
        };
      }
    }
    return null;
  }, [academicTermGroups]);

  const selectedAcademicYear = academicYearFilter || currentTerm?.academic_year || academicYearOptions[0] || "";
  const semesterOptions = useMemo(() => {
    const terms = academicTermGroups.find((group) => group.academic_year === selectedAcademicYear)?.terms ?? [];
    return terms
      .map((term) => term.semester)
      .filter((semester): semester is number => semester !== null)
      .sort((left, right) => left - right);
  }, [academicTermGroups, selectedAcademicYear]);

  useEffect(() => {
    if (!academicYearFilter && academicYearOptions.length > 0) {
      setAcademicYearFilter(currentTerm?.academic_year || academicYearOptions[0]);
    }
  }, [academicYearFilter, academicYearOptions, currentTerm]);

  useEffect(() => {
    if (!semesterFilter && currentTerm) {
      setAcademicYearFilter(currentTerm.academic_year);
      setSemesterFilter(String(currentTerm.term.semester ?? ""));
      setAcademicTermId(currentTerm.term.id);
    }
  }, [semesterFilter, currentTerm]);

  const params = {
    skip: (page - 1) * rowsPerPage,
    limit: rowsPerPage,
    teacher_id: teacherId,
    ...(academicTermId ? { academic_term_id: academicTermId } : {}),
    ...(search ? { search } : {}),
  };

  const advisorParams = {
    skip: 0,
    limit: 50,
    teacher_id: teacherId,
  };

  const { data: advisorData, isLoading: isAdvisorLoading, isError: isAdvisorError, error: advisorError } =
    useGetAdvisorClasses(advisorParams, {
      enabled: Boolean(teacherId),
    });

  const { data: teachingData, isLoading: isTeachingLoading, isError: isTeachingError, error: teachingError } =
    useGetTeachingClasses(params, {
      enabled: Boolean(teacherId),
    });

  const isLoading = isAdvisorLoading || isTeachingLoading;
  const isError = isAdvisorError || isTeachingError;
  const error = advisorError ?? teachingError;

  const handleSemesterChange = (event: SelectChangeEvent<string>) => {
    const nextSemester = event.target.value;
    setSemesterFilter(nextSemester);

    const term = findAcademicTerm(academicTermGroups, selectedAcademicYear, nextSemester);
    setAcademicTermId(term?.id ?? "");
  };

  return (
    <main className="admin-main-container">
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {(error as any)?.response?.data?.detail ?? t("teacherManagementScore.errors.loadClasses")}
        </Alert>
      ) : (
        <>
          <Box className="management-score__layout">
            <Box className="management-score__section management-score__section--wide">
              <Box className="management-score__section-header">
                <Typography className="management-score__section-title">
                  {t("teacherManagementScore.titleTeachingClasses")}
                </Typography>
                <Typography className="management-score__section-note">
                  {t("teacherManagementScore.noteTeachingClasses")}
                </Typography>
              </Box>
              <Box className="management-score__section-controls">
                <ManagementControls
                  searchValue={search}
                  academicYearFilter={selectedAcademicYear}
                  semesterFilter={semesterFilter}
                  academicYearOptions={academicYearOptions}
                  semesterOptions={semesterOptions}
                  onSearchChange={(value) => setSearch(value)}
                  onSearchSubmit={() => setPage(1)}
                  onSearchClear={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  onAcademicYearChange={(event: SelectChangeEvent<string>) => {
                    setAcademicYearFilter(event.target.value);
                    setSemesterFilter("");
                    setAcademicTermId("");
                  }}
                  onSemesterChange={handleSemesterChange}
                />
              </Box>
              <TeachingClassTable rows={teachingData?.data} academicTermId={academicTermId} />
              <Box className="management-score__pagination">
                <PaginationUniCore
                  totalItems={teachingData?.total || 0}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(currentPage) => setPage(currentPage)}
                  onRowsPerPageChange={(rows) => {
                    setRowsPerPage(rows);
                    setPage(1);
                  }}
                />
              </Box>
            </Box>

            <Box className="management-score__section management-score__section--narrow">
              <Box className="management-score__section-header">
                <Typography className="management-score__section-title">
                  {t("teacherManagementScore.titleAdvisorClasses")}
                </Typography>
                <Typography className="management-score__section-note">
                  {t("teacherManagementScore.noteAdvisorClasses")}
                </Typography>
              </Box>
              <AdvisorClass rows={advisorData?.data} />
            </Box>
          </Box>

        </>
      )}
    </main>
  );
}

export default TeacherManagementScore;
