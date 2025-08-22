import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Paper from "@mui/material/Paper";

import getGradeColor from "../utils/gradesColor"

import "./styles/studentTableScore.css";

function createData(
  student_code: string,
  name: string,
  grade4: string,
  grade10: string,
  gpa4: string,
  accumulated_gpa4: string,
  accumulated_gpa10: string,
  accumulated_credits: string,
  studied_credits: string
) {
  return { student_code, name, grade4, grade10, gpa4, accumulated_gpa4, accumulated_gpa10, accumulated_credits, studied_credits };
}

const rows = [
  createData(
    "10122256",
    "Lý Văn Minh",
    "Giỏi",
    "Giỏi",
    "3.38",
    "3.38",
    "8.28",
    "112 / 112",
    "112"
  ),
];

export function StudentTotalScore() {
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
              <TableCell className="primary-thead__cell" align="center">TBC H4</TableCell>
              <TableCell className="primary-thead__cell" align="center">TBC H10</TableCell>
              <TableCell className="primary-thead__cell" align="center">Số tín chỉ tích lũy</TableCell>
              <TableCell className="primary-thead__cell" align="center">Số tín chỉ học tập</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="primary-tbody">
            {rows.map((row) => (
              <TableRow key={row.student_code} className="primary-trow">
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

                <TableCell className="primary-tcell" align="center">{row.gpa4}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.accumulated_gpa4}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.accumulated_gpa10}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.accumulated_credits}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.studied_credits}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StudentTotalScore;