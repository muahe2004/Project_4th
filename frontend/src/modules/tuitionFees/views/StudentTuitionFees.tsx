import { useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useGetStudentsWithTuitionFees } from "../apis/getStudentsWithTuitionFees";
import StudentTuitionFeeTable from "../components/StudentTuitionFeeTable";
import "./styles/StudentTuitionFees.css";

export function StudentTuitionFees() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(user?.id && { student_id: user.id }),
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
