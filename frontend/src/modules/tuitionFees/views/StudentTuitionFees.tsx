import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useGetStudentsWithTuitionFees } from "../apis/getStudentsWithTuitionFees";
import StudentTuitionFeeTable from "../components/StudentTuitionFeeTable";
import AdminStudentTuitionListTable from "../components/AdminStudentTuitionListTable";
import { dashBoardUrl } from "../../../routes/urls";
import "./styles/StudentTuitionFees.css";

export function StudentTuitionFees() {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAdminFlow = location.pathname.startsWith("/admin/");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(isAdminFlow && statusFilter && { status: statusFilter }),
    ...(!isAdminFlow && user?.id && { student_id: user.id }),
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
      {isAdminFlow && (
        <BreadCrumb
          className="student-tuition-fees-breadcrumb"
          items={[
            { label: "Dashboard", to: dashBoardUrl },
            { label: "Học phí theo sinh viên" },
          ]}
        />
      )}
      {isAdminFlow && (
        <div className="admin-main-box">
          <StatusFilter
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={[
              { value: "none", label: t("tuitionFees.statusFilter.none") },
              { value: "unpaid", label: t("tuitionFees.statusFilter.unpaid") },
              { value: "paid", label: t("tuitionFees.statusFilter.paid") },
            ]}
          />
          <SearchEngine
            placeholder="Tìm theo mã sinh viên, tên sinh viên..."
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>
      )}
      {isAdminFlow ? (
        <AdminStudentTuitionListTable rows={studentsWithTuitionFees?.data ?? []} />
      ) : (
        <StudentTuitionFeeTable studentsWithTuitionFees={studentsWithTuitionFees} />
      )}

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
