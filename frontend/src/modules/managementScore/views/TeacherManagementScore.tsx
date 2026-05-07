import { useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useGetTeachingClasses } from "../apis/getTeachingClasses";
import { useGetAdvisorClasses } from "../apis/getAdvisorClass";
import AdvisorClass from "../components/AdvisorClass";
import TeachingClassTable from "../components/TeachingClassTable";

import "./styles/ManagementScore.css";

const DEFAULT_ROWS_PER_PAGE = 10;

export function TeacherManagementScore() {
  const user = useAuthStore((state) => state.user);
  const teacherId = user?.id;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [search, setSearch] = useState("");

  const params = {
    skip: (page - 1) * rowsPerPage,
    limit: rowsPerPage,
    teacher_id: teacherId,
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

  return (
    <main className="admin-main-container">
      <Box className="admin-main-box management-score__controls">
        <SearchEngine
          placeholder="Tìm theo mã lớp, tên lớp, môn giảng dạy..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {(error as any)?.response?.data?.detail ?? "Lấy danh sách lớp thất bại"}
        </Alert>
      ) : (
        <>
          <Box className="management-score__section">
            <Box className="management-score__section-header">
              <Typography className="management-score__section-title">
                Danh sách lớp chủ nhiệm
              </Typography>
            </Box>
            <AdvisorClass rows={advisorData?.data} />
          </Box>

          <Box className="management-score__section">
            <Box className="management-score__section-header">
              <Typography className="management-score__section-title">
                Danh sách lớp giảng dạy
              </Typography>
            </Box>
            <TeachingClassTable rows={teachingData?.data} />
          </Box>

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
        </>
      )}
    </main>
  );
}

export default TeacherManagementScore;
