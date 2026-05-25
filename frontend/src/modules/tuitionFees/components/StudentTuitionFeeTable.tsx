import { useState } from "react";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatVndAmount } from "../../../utils/formatCurrency";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useCreateVnpayPaymentUrl } from "../apis/createVnpayPaymentUrl";
import type { IStudentTuitionFeeListResponse } from "../types/studentTuitionFee";

interface StudentTuitionFeeTableProps {
  studentsWithTuitionFees?: IStudentTuitionFeeListResponse;
}

export default function StudentTuitionFeeTable({
  studentsWithTuitionFees,
}: StudentTuitionFeeTableProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { mutateAsync: createPaymentUrl, isPending } = useCreateVnpayPaymentUrl();

  const handlePay = async (studentTuitionFeeId: string) => {
    try {
      setProcessingId(studentTuitionFeeId);
      const response = await createPaymentUrl({
        student_tuition_fee_id: studentTuitionFeeId,
        bank_code: "NCB",
        order_info: "Thanh toan hoc phi",
      });

      if (!response?.payment_url) {
        showSnackbar("Không tạo được link thanh toán", "error");
        return;
      }

      window.location.href = response.payment_url;
    } catch (error) {
      showSnackbar("Không thể tạo link thanh toán VNPAY", "error");
    } finally {
      setProcessingId(null);
    }
  };

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
            <TableCell className="primary-thead__cell" align="center">
              {t("common.actions")}
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
                <TableCell className="sticky-tcell" align="center">
                  <Button
                    variant="contained"
                    size="small"
                    disabled={
                      !firstTuitionFee?.id ||
                      (firstTuitionFee?.debt_amount ?? 0) <= 0 ||
                      isPending
                    }
                    onClick={() => firstTuitionFee?.id && handlePay(firstTuitionFee.id)}
                    sx={{
                      backgroundColor: "var(--primary-color)",
                      textTransform: "none",
                    }}
                  >
                    {processingId === firstTuitionFee?.id ? "Đang xử lý..." : "Thanh toán"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
