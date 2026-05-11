import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import { formatVndAmount } from "../../../utils/formatCurrency";
import type { ITuitionFee, TuitionFeeListResponse } from "../types";

interface TuitionFeeTableProps {
  tuitionFees?: TuitionFeeListResponse;
  onEdit?: (tuitionFee: ITuitionFee) => void;
  onDelete?: (tuitionFee: ITuitionFee) => void;
}

export function TuitionFeeTable({ tuitionFees, onEdit, onDelete }: TuitionFeeTableProps) {
  const { t } = useTranslation();
  const normalizeStatus = (status?: string | null) => status || "";

  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="tuition fees table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="left">
              {t("tuitionFees.table.name")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.table.academicYear")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.table.term")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              {t("tuitionFees.table.trainingProgram")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.table.pricePerCredit")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.table.amount")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("tuitionFees.table.status")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("common.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="sticky-tbody">
          {(tuitionFees?.data ?? []).map((row) => (
            <TableRow key={row.id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="left">
                {row.name || "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.academic_year}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.term ?? "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.training_program_info?.training_program_name || row.training_program_info?.program_type || "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {formatVndAmount(row.price_per_credit)}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {formatVndAmount(row.amount)}
              </TableCell>
              <TableCell
                className="sticky-tcell"
                align="center"
                sx={{ color: getStatusColor(normalizeStatus(row.status)) }}
              >
                {getStatusDisplay(normalizeStatus(row.status))}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                <IconButton
                  className="primary-tcell__button--icon"
                  onClick={() => onEdit?.(row)}
                >
                  <EditSquareIcon />
                </IconButton>
                <IconButton
                  className="primary-tcell__button--icon primary-tcell__button--delete"
                  onClick={() => onDelete?.(row)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TuitionFeeTable;
