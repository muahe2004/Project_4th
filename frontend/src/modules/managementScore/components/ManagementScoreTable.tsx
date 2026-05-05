import { useNavigate } from "react-router-dom";
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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { layOutAdminUrl, scoreDetailsUrl } from "../../../routes/urls";
import getGradeColor from "../../grades/utils/gradesColor";
import type { IManagementScoreTableRow } from "../types";

import "../../grades/components/styles/studentTableScore.css";

interface ManagementScoreTableProps {
  rows?: IManagementScoreTableRow[];
}

export function ManagementScoreTable({ rows }: ManagementScoreTableProps) {
  const navigate = useNavigate();

  const handleViewDetails = (row: IManagementScoreTableRow) => {
    navigate(`${layOutAdminUrl}/${scoreDetailsUrl}`, {
      state: {
        studentId: row.student_info.id,
        studentCode: row.student_info.student_code,
        studentName: row.student_info.name,
        classId: row.class_info.class_id,
        classCode: row.class_info.class_code,
        className: row.class_info.class_name,
      },
    });
  };

  return (
    <TableContainer className="sticky-table-container" component={Paper}>
      <Table stickyHeader className="sticky-table" aria-label="student gpa table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="center">Mã sinh viên</TableCell>
            <TableCell className="primary-thead__cell" align="left">Tên sinh viên</TableCell>
            <TableCell className="primary-thead__cell" align="center">Email</TableCell>
            <TableCell className="primary-thead__cell" align="center">Lớp</TableCell>
            <TableCell className="primary-thead__cell" align="center">Xếp loại H4</TableCell>
            <TableCell className="primary-thead__cell" align="center">Xếp loại H10</TableCell>
            <TableCell className="primary-thead__cell" align="center">TBC H4</TableCell>
            <TableCell className="primary-thead__cell" align="center">TBC H10</TableCell>
            <TableCell className="primary-thead__cell" align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="sticky-tbody">
          {(rows ?? []).map((row) => (
            <TableRow key={row.student_info.id} className="sticky-trow">
              <TableCell className="sticky-tcell" align="center">
                {row.student_info.student_code}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.student_info.name}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.student_info.email ?? "-"}
              </TableCell>
              <TableCell className="sticky-tcell" align="left">
                {row.class_info.class_code ? `${row.class_info.class_code} - ${row.class_info.class_name ?? ""}` : row.class_info.class_name ?? "-"}
              </TableCell>
              <TableCell
                className={`sticky-tcell primary-tcell ${getGradeColor(row.gpa.grade4)}`}
                align="center"
              >
                {row.gpa.grade4}
              </TableCell>
              <TableCell
                className={`sticky-tcell primary-tcell ${getGradeColor(row.gpa.grade10)}`}
                align="center"
              >
                {row.gpa.grade10}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.gpa.gpa4.toFixed(2)}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                {row.gpa.accumulated_gpa10.toFixed(2)}
              </TableCell>
              <TableCell className="sticky-tcell" align="center">
                <IconButton
                  className="primary-tcell__button--icon"
                  onClick={() => handleViewDetails(row)}
                >
                  <VisibilityOutlinedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ManagementScoreTable;
