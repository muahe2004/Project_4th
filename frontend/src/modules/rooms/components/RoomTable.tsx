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
import type { IRoom } from "../types";

interface RoomTableProps {
  rooms?: {
    total: number;
    data: IRoom[];
  };
  onEdit?: (room: IRoom) => void;
  onDelete?: (room: IRoom) => void;
}

export function RoomTable({ rooms, onEdit, onDelete }: RoomTableProps) {
  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="rooms table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              Số phòng
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Loại phòng
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Số chỗ ngồi
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
          {(rooms?.data ?? []).map((row) => (
            <TableRow key={row.id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="center">
                {row.room_number}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.type}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.seats}
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

export default RoomTable;
