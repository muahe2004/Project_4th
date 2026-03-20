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
import type { ITeachingScheduleResponse } from "../types";

interface TeachingSchedulesTableProps {
  teachingSchedules?: {
    data: ITeachingScheduleResponse[];
    total: number;
  };
  onEdit?: (teachingSchedule: ITeachingScheduleResponse) => void;
  onDelete?: (teachingSchedule: ITeachingScheduleResponse) => void;
}

export function TeachingSchedulesTable({
  teachingSchedules,
  onEdit,
  onDelete,
}: TeachingSchedulesTableProps) {
  const rows = teachingSchedules?.data ?? [];

  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="teaching schedules table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              Lớp
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Giảng viên
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Email
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              SĐT
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Môn học
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Ngày học
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Tiết
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Phòng
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Trạng thái
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="sticky-tbody">
          {rows.length === 0 && (
            <TableRow className="sticky-trow">
              <TableCell className="sticky-tcell" align="center" colSpan={10}>
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => (
            <TableRow key={row.id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="left">
                {row.class?.class_name ?? "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.teacher?.teacher_name ?? "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.teacher?.teacher_email ?? "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.teacher?.teacher_phone ?? "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.subject?.subject_name ?? row.learning_schedule.subject_id}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {dayjs(row.learning_schedule.date).format("DD-MM-YYYY")}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.learning_schedule.start_period} - {row.learning_schedule.end_period}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.room?.room_number ?? "-"}
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TeachingSchedulesTable;
