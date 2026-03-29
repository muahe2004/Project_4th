import dayjs from "dayjs";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import type { IExaminationScheduleResponse } from "../types";

interface ExaminationScheduleTableProps {
  examinationSchedules?: {
    data: IExaminationScheduleResponse[];
    total: number;
  };
}

export function ExaminationScheduleTable({
  examinationSchedules,
}: ExaminationScheduleTableProps) {
  const rows = examinationSchedules?.data ?? [];

  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="examination schedules table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              Lớp
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Môn thi
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Ngày thi
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Giờ thi
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Phòng
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Giám thị 1
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Giám thị 2
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Trạng thái
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="sticky-tbody">
          {rows.length === 0 && (
            <TableRow className="sticky-trow">
              <TableCell className="sticky-tcell" align="center" colSpan={8}>
                Không có dữ liệu
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ExaminationScheduleTable;
