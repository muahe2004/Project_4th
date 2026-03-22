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
import type { ISubject } from "../types";

interface SubjectsTableProps {
  subjects?: {
    total: number;
    data: ISubject[];
  };
  onEdit?: (subject: ISubject) => void;
  onDelete?: (subject: ISubject) => void;
}

export function SubjectsTable({ subjects, onEdit, onDelete }: SubjectsTableProps) {
  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="subjects table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              Mã học phần
            </TableCell>
            <TableCell className="primary-thead__cell subject-name-tcell" align="center">
              Tên học phần
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Số tín chỉ
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
          {(subjects?.data ?? []).map((row) => (
            <TableRow key={row.id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="center">
                {row.subject_code}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.name}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.credit}
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

export default SubjectsTable;
