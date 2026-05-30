import { useMemo } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useLocation } from "react-router-dom";

import { useGetStudentsWithTuitionFees } from "../apis/getStudentsWithTuitionFees";
import { formatVndAmount } from "../../../utils/formatCurrency";
import { layOutAdminUrl, studentTuitionFeeUrl } from "../../../routes/urls";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";

export function StudentTuitionFeeDetails() {
  const location = useLocation();
  const state = (location.state as {
    studentId?: string;
    studentCode?: string;
    studentName?: string;
    classCode?: string;
    className?: string;
  }) || {};

  const studentId = state.studentId;

  const { data, isLoading } = useGetStudentsWithTuitionFees({
    skip: 0,
    limit: 1,
    student_id: studentId,
  });

  const student = useMemo(() => data?.data?.[0], [data]);
  const tuitionRows = student?.tuition_fees ?? [];

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="student-tuition-fees-breadcrumb"
        items={[
          { label: "Dashboard", to: "/admin" },
          { label: "Học phí theo sinh viên", to: `${layOutAdminUrl}/${studentTuitionFeeUrl}` },
          { label: "Chi tiết học phí" },
        ]}
      />

      <div style={{ marginBottom: 12, fontWeight: 600 }}>
        {state.studentCode} - {state.studentName} ({state.className || state.classCode || "-"})
      </div>

      <TableContainer className="sticky-table-container student-tuition-fees__table-container" component={Paper}>
        <Table stickyHeader className="sticky-table" aria-label="student tuition fee details table">
          <TableHead className="primary-thead">
            <TableRow className="primary-trow">
              <TableCell className="primary-thead__cell" align="left">Học phí</TableCell>
              <TableCell className="primary-thead__cell" align="center">Kỳ</TableCell>
              <TableCell className="primary-thead__cell" align="center">Phải đóng</TableCell>
              <TableCell className="primary-thead__cell" align="center">Đã đóng</TableCell>
              <TableCell className="primary-thead__cell" align="center">Còn nợ</TableCell>
              <TableCell className="primary-thead__cell" align="center">Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="sticky-tbody">
            {!studentId && (
              <TableRow className="sticky-trow">
                <TableCell className="sticky-tcell" align="center" colSpan={6}>Thiếu thông tin sinh viên</TableCell>
              </TableRow>
            )}
            {studentId && isLoading && (
              <TableRow className="sticky-trow">
                <TableCell className="sticky-tcell" align="center" colSpan={6}>Đang tải...</TableCell>
              </TableRow>
            )}
            {studentId && !isLoading && tuitionRows.length === 0 && (
              <TableRow className="sticky-trow">
                <TableCell className="sticky-tcell" align="center" colSpan={6}>Sinh viên chưa có khoản học phí nào</TableCell>
              </TableRow>
            )}
            {tuitionRows.map((item) => (
              <TableRow key={item.id} className="sticky-trow">
                <TableCell className="sticky-tcell" align="left">{item.tuition_fee?.name || "-"}</TableCell>
                <TableCell className="sticky-tcell" align="center">{item.tuition_fee?.term ?? "-"}</TableCell>
                <TableCell className="sticky-tcell" align="center">{formatVndAmount(item.payable_amount)}</TableCell>
                <TableCell className="sticky-tcell" align="center">{formatVndAmount(item.paid_amount)}</TableCell>
                <TableCell className="sticky-tcell" align="center">{formatVndAmount(item.debt_amount)}</TableCell>
                <TableCell className="sticky-tcell" align="center">{item.status || ((item.debt_amount ?? 0) <= 0 ? "paid" : "unpaid")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}

export default StudentTuitionFeeDetails;
