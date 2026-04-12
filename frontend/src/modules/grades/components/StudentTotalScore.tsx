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
            {!summary ? (
              <TableRow className="primary-trow">
                <TableCell className="primary-tcell" colSpan={9} align="center">
                  Chưa có dữ liệu điểm
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="primary-trow">
                <TableCell className="primary-tcell" align="left">{summary.student_code}</TableCell>
                <TableCell className="primary-tcell" align="left">{summary.name}</TableCell>
                <TableCell
                  className={`primary-tcell ${getGradeColor(summary.grade4)}`}
                  align="center"
                >
                  {summary.grade4}
                </TableCell>
                <TableCell
                  className={`primary-tcell ${getGradeColor(summary.grade10)}`}
                  align="center"
                >
                  {summary.grade10}
                </TableCell>
                <TableCell className="primary-tcell" align="center">{formatNumber(summary.gpa4)}</TableCell>
                <TableCell className="primary-tcell" align="center">{formatNumber(summary.accumulated_gpa4)}</TableCell>
                <TableCell className="primary-tcell" align="center">{formatNumber(summary.accumulated_gpa10)}</TableCell>
                <TableCell className="primary-tcell" align="center">{summary.accumulated_credits}</TableCell>
                <TableCell className="primary-tcell" align="center">{summary.studied_credits}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StudentTotalScore;
