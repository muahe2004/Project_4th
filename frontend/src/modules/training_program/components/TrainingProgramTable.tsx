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
import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";

import type { ITrainingProgram } from "../types";

interface TrainingProgramTableProps {
  trainingPrograms?: {
    total: number;
    data: ITrainingProgram[];
  };
  onEdit?: (trainingProgram: ITrainingProgram) => void;
}

export function TrainingProgramTable({
  trainingPrograms,
  onEdit,
}: TrainingProgramTableProps) {
  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="training programs table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">
              Tên CTĐT
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Loại CTĐT
            </TableCell>
            <TableCell className="primary-thead__cell" align="center">
              Niên khoá
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
          {(trainingPrograms?.data ?? []).map((row) => (
            <TableRow key={row.id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="left">
                {row.training_program_name || ""}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.program_type}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.academic_year}
              </TableCell>
              <TableCell className="sticky-tcell" align="center" sx={{ color: getStatusColor(row.status || "") }}>
                {getStatusDisplay(row.status || "")}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                <IconButton className="primary-tcell__button--icon" onClick={() => onEdit?.(row)}>
                  <EditSquareIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TrainingProgramTable;
