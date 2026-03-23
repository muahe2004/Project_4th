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
import type { ITeacherResponse, TeacherListResponse } from "../types";

interface TeacherTableProps {
  teachers?: TeacherListResponse;
  onEdit?: (teacher: ITeacherResponse) => void;
  onDelete?: (teacher: ITeacherResponse) => void;
}

export function TeacherTable({ teachers, onEdit, onDelete }: TeacherTableProps) {
  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="teachers table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              Mã giảng viên
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              Tên giảng viên
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              Email
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Số điện thoại
            </TableCell>
            <TableCell className="primary-thead__cell" align="left">
              Khoa
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
          {(teachers?.data ?? []).map((row) => (
            <TableRow key={row.id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="center">
                {row.teacher_code}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.name}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.email}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.phone || "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.department_name || "-"}
              </TableCell>
              <TableCell
                className="sticky-tcell"
                align="center"
                sx={{ color: getStatusColor(row.status) }}
              >
                {getStatusDisplay(row.status)}
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

export default TeacherTable;
