import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { IStudentTuitionFeeRow } from "../types/studentTuitionFee";
import { layOutAdminUrl, studentTuitionFeeDetailsUrl } from "../../../routes/urls";

interface AdminStudentTuitionListTableProps {
  rows: IStudentTuitionFeeRow[];
}

const getTuitionStatus = (row: IStudentTuitionFeeRow) => {
  const items = row.tuition_fees ?? [];
  if (items.length === 0) return "Chưa có học phí";

  const hasAnyPaid = items.some((item) => (item.paid_amount ?? 0) > 0);
  if (!hasAnyPaid) return "Chưa đóng";

  const allPaid = items.every((item) => (item.debt_amount ?? 0) <= 0 || item.status === "paid");
  if (allPaid) return "Đã đóng đủ";

  return "Đóng một phần";
};

const getTuitionStatusClassName = (status: string) => {
  if (status === "Chưa có học phí") return "tuition-status tuition-status--none";
  if (status === "Chưa đóng") return "tuition-status tuition-status--unpaid";
  if (status === "Đã đóng đủ") return "tuition-status tuition-status--paid";
  return "tuition-status tuition-status--paid";
};

export default function AdminStudentTuitionListTable({ rows }: AdminStudentTuitionListTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <TableContainer className="sticky-table-container student-tuition-fees__table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="admin student tuition list table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="left">{t("tuitionFees.studentTable.studentCode")}</TableCell>
            <TableCell className="primary-thead__cell" align="left">{t("tuitionFees.studentTable.studentName")}</TableCell>
            <TableCell className="primary-thead__cell" align="left">{t("tuitionFees.studentTable.class")}</TableCell>
            <TableCell className="primary-thead__cell" align="center">{t("tuitionFees.table.status")}</TableCell>
            <TableCell className="primary-thead__cell" align="center">{t("common.actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="sticky-tbody">
          {rows.length === 0 && (
            <TableRow className="sticky-trow">
              <TableCell className="sticky-tcell" align="center" colSpan={5}>Không có dữ liệu</TableCell>
            </TableRow>
          )}
          {rows.map((row) => {
            const status = getTuitionStatus(row);
            return (
            <TableRow key={row.student_id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="left">{row.student_code || "-"}</TableCell>
              <TableCell className="sticky-tcell" align="left">{row.student_name || "-"}</TableCell>
              <TableCell className="sticky-tcell" align="left">{row.class_name || row.class_code || "-"}</TableCell>
              <TableCell className="sticky-tcell" align="center">
                <span className={getTuitionStatusClassName(status)}>{status}</span>
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                <IconButton
                  className="primary-tcell__button--icon"
                  onClick={() =>
                    navigate(`${layOutAdminUrl}/${studentTuitionFeeDetailsUrl}`, {
                      state: {
                        studentId: row.student_id,
                        studentCode: row.student_code,
                        studentName: row.student_name,
                        classCode: row.class_code,
                        className: row.class_name,
                      },
                    })
                  }
                >
                  <VisibilityOutlinedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
