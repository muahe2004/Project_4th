import { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { dashBoardUrl, layOutAdminUrl, tuitionFeeUrl } from "../../../routes/urls";
import { useGetStudentsWithTuitionFees } from "../apis/getStudentsWithTuitionFees";
import StudentTuitionFeeTable from "../components/StudentTuitionFeeTable";
import "./styles/StudentTuitionFees.css";

export function StudentTuitionFees() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
  };

  const { data: studentsWithTuitionFees, isLoading } = useGetStudentsWithTuitionFees(params);

  if (isLoading) {
    return (
      <main className="admin-main-container">
        <Loading />
      </main>
    );
  }

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="student-tuition-fees-breadcrumb"
        items={[
          { label: "Dashboard", to: dashBoardUrl },
          { label: "Tuition Fees", to: `${layOutAdminUrl}/${tuitionFeeUrl}` },
          { label: "Students with Tuition Fees" },
        ]}
      />

      <Box className="admin-main-box">
        <SearchEngine
          placeholder="Tìm theo mã sinh viên, tên, email..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Button
          onClick={() => {
            navigate(`${layOutAdminUrl}/${tuitionFeeUrl}`);
          }}
          className="btn-spacing-left"
        >
          Back to Tuition Fees
        </Button>
      </Box>

      <StudentTuitionFeeTable studentsWithTuitionFees={studentsWithTuitionFees} />

      <PaginationUniCore
        totalItems={studentsWithTuitionFees?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(currentPage) => setPage(currentPage)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
      />
    </main>
  );
}
