import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { formatVndAmount } from "../../../utils/formatCurrency";
import type { IStudentTuitionFeeListResponse } from "../types/studentTuitionFee";

interface StudentTuitionFeeTableProps {
  studentsWithTuitionFees?: IStudentTuitionFeeListResponse;
}

export default function StudentTuitionFeeTable({
  studentsWithTuitionFees,
}: StudentTuitionFeeTableProps) {
  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="student tuition fees table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              Mã sinh viên
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              Tên sinh viên
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              Lớp
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Học phí
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Kỳ
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Số tiền phải đóng
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Đã đóng
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Còn nợ
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
