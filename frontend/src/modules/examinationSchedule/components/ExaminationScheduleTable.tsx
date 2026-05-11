import dayjs from "dayjs";
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

import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import type { IExaminationScheduleResponse } from "../types";
import { useTranslation } from "react-i18next";

interface ExaminationScheduleTableProps {
  examinationSchedules?: {
    data: IExaminationScheduleResponse[];
    total: number;
  };
  onEdit?: (examinationSchedule: IExaminationScheduleResponse) => void;
  onDelete?: (examinationSchedule: IExaminationScheduleResponse) => void;
}

export function ExaminationScheduleTable({
  examinationSchedules,
  onEdit,
  onDelete,
}: ExaminationScheduleTableProps) {
  const { t } = useTranslation();
  const rows = examinationSchedules?.data ?? [];

  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="examination schedules table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.class")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.subject")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.date")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.time")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.room")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.invigilator1")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.invigilator2")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.status")}
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              {t("examinationSchedules.table.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="sticky-tbody">
          {rows.length === 0 && (
            <TableRow className="sticky-trow">
              <TableCell className="sticky-tcell" align="center" colSpan={9}>
                {t("examinationSchedules.table.empty")}
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => {
            const invigilator1 = row.invigilator[0];
            const invigilator2 = row.invigilator[1];

            return (
              <TableRow key={row.id} className="sticky-trow">
                <TableCell className="sticky-tcell" align="left">
                  {row.class_info?.class_code ?? row.class_info?.class_name ?? "-"}
                </TableCell>
                <TableCell className="sticky-tcell" align="left">
                  {row.subject_info?.subject_name ?? row.subject_info?.subject_code ?? "-"}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                  {dayjs(row.date).format("DD-MM-YYYY")}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                  {dayjs(row.start_time).format("HH:mm")} - {dayjs(row.end_time).format("HH:mm")}
                </TableCell>
                <TableCell className="sticky-tcell" align="center">
                  {row.room_info?.room_number ?? "-"}
                </TableCell>
                <TableCell className="sticky-tcell" align="left">
                  {invigilator1?.invigilator_name ?? "-"}
                </TableCell>
                <TableCell className="sticky-tcell" align="left">
                  {invigilator2?.invigilator_name ?? "-"}
                </TableCell>
                <TableCell
                  className="sticky-tcell"
                  align="center"
                  sx={{ color: getStatusColor(row.status || "") }}
                >
                  {getStatusDisplay(row.status || "")}
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ExaminationScheduleTable;
