import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Paper from "@mui/material/Paper";

import getGradeColor from "../utils/gradesColor";
import type { ScoresTableProps } from "../types";

import "./styles/studentTableScore.css";

function formatScore(value: number | null, digits = 2): string {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

export function ScoresTable({ rows }: ScoresTableProps) {
  return (
    <Box className="grades-student__information">
      <TableContainer className="primary-table-container" component={Paper}>
        <Table className="primary-table" aria-label="scores table">
          <TableHead className="primary-thead">
            <TableRow className="primary-trow">
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">STT</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">Mã học phần</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">Tên học phần</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">Số tín chỉ</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">Hệ số</TableCell>

              <TableCell className="primary-thead__cell" colSpan={3} align="center">Điểm thành phần</TableCell>
              <TableCell className="primary-thead__cell" colSpan={3} align="center">Điểm học lại</TableCell>
              <TableCell className="primary-thead__cell" colSpan={3} align="center">Trung bình môn</TableCell>

              <TableCell className="primary-thead__cell" rowSpan={2} align="center">Ghi chú</TableCell>
            </TableRow>

            <TableRow className="primary-trow">
              <TableCell className="primary-thead__cell" align="center">Đ1</TableCell>
              <TableCell className="primary-thead__cell" align="center">Đ2</TableCell>
              <TableCell className="primary-thead__cell" align="center">Thi</TableCell>
              <TableCell className="primary-thead__cell" align="center">Đ1</TableCell>
              <TableCell className="primary-thead__cell" align="center">Đ2</TableCell>
              <TableCell className="primary-thead__cell" align="center">Thi</TableCell>
              <TableCell className="primary-thead__cell" align="center">Hệ 10</TableCell>
              <TableCell className="primary-thead__cell" align="center">Hệ 4</TableCell>
              <TableCell className="primary-thead__cell thead-cell__border--right" align="center">Điểm chữ</TableCell>
            </TableRow>
          </TableHead>

          <TableBody className="primary-tbody">
            {rows.length === 0 ? (
              <TableRow className="primary-trow">
                <TableCell className="primary-tcell" colSpan={15} align="center">
                  Không có dữ liệu điểm
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.key} className="primary-trow">
                  <TableCell className="primary-tcell" align="center">{row.index}</TableCell>
                  <TableCell className="primary-tcell" align="center">{row.subject_code}</TableCell>
                  <TableCell className="primary-tcell" align="left">{row.subject_name}</TableCell>
                  <TableCell className="primary-tcell" align="center">{row.credits}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.weight)}</TableCell>

                  <TableCell className="primary-tcell" align="center">{formatScore(row.exam1)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.exam2)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.exam3)}</TableCell>

                  <TableCell className="primary-tcell" align="center">{formatScore(row.recheck1)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.recheck2)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.recheck3)}</TableCell>

                  <TableCell className="primary-tcell" align="center">{formatScore(row.avg10)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.avg4)}</TableCell>
                  <TableCell
                    className={`primary-tcell ${getGradeColor(row.grade)}`}
                    align="center"
                  >
                    {row.grade}
                  </TableCell>
                  <TableCell className="primary-tcell tcell-note" align="center">{row.note}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ScoresTable;
