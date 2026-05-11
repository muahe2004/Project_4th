import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatVndAmount } from "../../../utils/formatCurrency";
import type { IStudentTuitionFeeListResponse } from "../types/studentTuitionFee";

interface StudentTuitionFeeTableProps {
  studentsWithTuitionFees?: IStudentTuitionFeeListResponse;
}

export default function StudentTuitionFeeTable({
  studentsWithTuitionFees,
}: StudentTuitionFeeTableProps) {
  const { t } = useTranslation();
  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="student tuition fees table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.studentTable.studentCode")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              {t("tuitionFees.studentTable.studentName")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              {t("tuitionFees.studentTable.class")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.studentTable.tuitionFee")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.studentTable.term")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.studentTable.payableAmount")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.studentTable.paidAmount")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.studentTable.debtAmount")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="sticky-tbody">
          {(studentsWithTuitionFees?.data ?? []).map((student) => {
            const firstTuitionFee = student.tuition_fees[0];

            return (
              <TableRow key={student.student_id} className="sticky-trow">
                <TableCell className="sticky-tcell" align="center">
                  {student.student_code}
                </TableCell>
                <TableCell className="sticky-tcell" align="left">
                  {student.student_name}
                </TableCell>
                <TableCell className="sticky-tcell" align="left">
                    {student.class_name || "-"}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                    {firstTuitionFee?.tuition_fee.name || "-"}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                    {firstTuitionFee?.tuition_fee.term ?? "-"}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                    {formatVndAmount(firstTuitionFee?.payable_amount)}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                    {formatVndAmount(firstTuitionFee?.paid_amount)}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                    {formatVndAmount(firstTuitionFee?.debt_amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
