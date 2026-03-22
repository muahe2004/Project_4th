import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Paper from "@mui/material/Paper";

import getGradeColor from "../utils/gradesColor";
import type { StudentTotalScoreProps } from "../types";

import "./styles/studentTableScore.css";

function formatNumber(value: number): string {
  if (Number.isNaN(value)) {
    return "0.00";
  }
  return value.toFixed(2);
}

export function StudentTotalScore({ summary }: StudentTotalScoreProps) {
  const row = summary ?? {
    student_code: "-",
    name: "-",
    grade4: "-",
    grade10: "-",
    gpa4: 0,
    accumulated_gpa4: 0,
    accumulated_gpa10: 0,
    accumulated_credits: 0,
    studied_credits: 0,
  };

  return (
    <Box className="student-tableScore">
      <TableContainer className="primary-table-container" component={Paper}>
        <Table className="primary-table" aria-label="student total score table">
          <TableHead className="primary-thead">
            <TableRow className="primary-trow">
              <TableCell className="primary-thead__cell" align="left">MSV</TableCell>
              <TableCell className="primary-thead__cell" align="left">Họ và tên</TableCell>
              <TableCell className="primary-thead__cell" align="center">Xếp loại H4</TableCell>
              <TableCell className="primary-thead__cell" align="center">Xếp loại H10</TableCell>
              <TableCell className="primary-thead__cell" align="center">TBC H4</TableCell>
              <TableCell className="primary-thead__cell" align="center">TBC TL H4</TableCell>
              <TableCell className="primary-thead__cell" align="center">TBC TL H10</TableCell>
              <TableCell className="primary-thead__cell" align="center">Số tín chỉ tích lũy</TableCell>
              <TableCell className="primary-thead__cell" align="center">Số tín chỉ học tập</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="primary-tbody">
            <TableRow className="primary-trow">
              <TableCell className="primary-tcell" align="left">{row.student_code}</TableCell>
              <TableCell className="primary-tcell" align="left">{row.name}</TableCell>
              <TableCell
                className={`primary-tcell ${getGradeColor(row.grade4)}`}
                align="center"
              >
                {row.grade4}
              </TableCell>
              <TableCell
                className={`primary-tcell ${getGradeColor(row.grade10)}`}
                align="center"
              >
                {row.grade10}
              </TableCell>
              <TableCell className="primary-tcell" align="center">{formatNumber(row.gpa4)}</TableCell>
              <TableCell className="primary-tcell" align="center">{formatNumber(row.accumulated_gpa4)}</TableCell>
              <TableCell className="primary-tcell" align="center">{formatNumber(row.accumulated_gpa10)}</TableCell>
              <TableCell className="primary-tcell" align="center">{row.accumulated_credits}</TableCell>
              <TableCell className="primary-tcell" align="center">{row.studied_credits}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StudentTotalScore;
