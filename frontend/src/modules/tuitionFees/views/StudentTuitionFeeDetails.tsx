import { useMemo } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetStudentsWithTuitionFees } from "../apis/getStudentsWithTuitionFees";
import { formatVndAmount } from "../../../utils/formatCurrency";
import { dashBoardUrl, layOutAdminUrl, studentTuitionFeeUrl } from "../../../routes/urls";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";

export function StudentTuitionFeeDetails() {
  const { t } = useTranslation();
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
          { label: t("tuitionFees.breadcrumb.dashboard"), to: dashBoardUrl },
          { label: t("tuitionFees.breadcrumb.studentTuitionFees"), to: `${layOutAdminUrl}/${studentTuitionFeeUrl}` },
          { label: t("tuitionFees.breadcrumb.studentTuitionFeeDetails") },
        ]}
      />

      <div style={{ marginBottom: 12, fontWeight: 600 }}>
        {state.studentCode} - {state.studentName} ({state.className || state.classCode || "-"})
      </div>

      <TableContainer className="sticky-table-container student-tuition-fees__table-container" component={Paper}>
        <Table stickyHeader className="sticky-table" aria-label="student tuition fee details table">
          <TableHead className="primary-thead">
            <TableRow className="primary-trow">
              <TableCell className="primary-thead__cell" align="left">{t("tuitionFees.studentTable.tuitionFee")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("tuitionFees.studentTable.term")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("tuitionFees.studentTable.payableAmount")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("tuitionFees.studentTable.paidAmount")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("tuitionFees.studentTable.debtAmount")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("tuitionFees.table.status")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="sticky-tbody">
            {!studentId && (
              <TableRow className="sticky-trow">
                <TableCell className="sticky-tcell" align="center" colSpan={6}>{t("tuitionFees.details.missingStudentInfo")}</TableCell>
              </TableRow>
            )}
            {studentId && isLoading && (
              <TableRow className="sticky-trow">
                <TableCell className="sticky-tcell" align="center" colSpan={6}>{t("dashboard.loading")}</TableCell>
              </TableRow>
            )}
            {studentId && !isLoading && tuitionRows.length === 0 && (
              <TableRow className="sticky-trow">
                <TableCell className="sticky-tcell" align="center" colSpan={6}>{t("tuitionFees.details.noTuitionFees")}</TableCell>
              </TableRow>
            )}
            {tuitionRows.map((item) => (
              <TableRow key={item.id} className="sticky-trow">
                <TableCell className="sticky-tcell" align="left">{item.tuition_fee?.name || "-"}</TableCell>
                <TableCell className="sticky-tcell" align="center">{item.tuition_fee?.term ?? "-"}</TableCell>
                <TableCell className="sticky-tcell" align="center">{formatVndAmount(item.payable_amount)}</TableCell>
                <TableCell className="sticky-tcell" align="center">{formatVndAmount(item.paid_amount)}</TableCell>
                <TableCell className="sticky-tcell" align="center">{formatVndAmount(item.debt_amount)}</TableCell>
                <TableCell className="sticky-tcell" align="center">{item.status || ((item.debt_amount ?? 0) <= 0 ? t("tuitionFees.statusFilter.paid") : t("tuitionFees.statusFilter.unpaid"))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}

export default StudentTuitionFeeDetails;
