import { useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { dashBoardUrl } from "../../../routes/urls";
import { useGetStudentGPA } from "../apis/getStudentGPA";
import ManagementScoreTable from "../components/ManagementScoreTable";

import "./styles/ManagementScore.css";

const DEFAULT_ROWS_PER_PAGE = 10;

export function ManagementScore() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [search, setSearch] = useState("");

  const params = {
    skip: (page - 1) * rowsPerPage,
    limit: rowsPerPage,
    ...(search && { search }),
  };

  const { data, isLoading, isError, error } = useGetStudentGPA(params);

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="management-score-breadcrumb"
        items={[
          { label: "Dashboard", to: dashBoardUrl },
          { label: "Quản lý điểm" },
        ]}
      />

      <Box className="admin-main-box">
        <SearchEngine
          placeholder="Tìm theo mã sinh viên, tên sinh viên..."
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
          {(error as any)?.response?.data?.detail ?? "Lấy dữ liệu điểm thất bại"}
        </Alert>
      ) : (
        <>
          <ManagementScoreTable rows={data?.data} />
          <Box className="management-score__pagination">
            <PaginationUniCore
              totalItems={data?.total || 0}
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

export default ManagementScore;
