import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Paper from "@mui/material/Paper";

function createData(
  index: string,
  subject_code: string,
  subject_name: string,
  credits: string,
  weight: string,
  exam1: string,
  exam2: string,
  exam3: string,
  recheck1: string,
  recheck2: string,
  recheck3: string,
  avg10: string,
  avg4: string,
  grade: string,
  note: string
) {
  return {
    index, subject_code, subject_name, credits, weight,
    exam1, exam2, exam3,
    recheck1, recheck2, recheck3,
    avg10, avg4, grade, note
  };
}

const rows = [
  createData("1", "111111", "Đại số tuyến tính", "2", "1.0", "8.5", "7.0", "7.8", "-", "-", "-", "7.8", "3.0", "B", ""),
  createData("2", "921113", "Giáo dục thể chất 1", "1", "1.0", "9.0", "8.5", "8.8", "-", "-", "-", "8.8", "3.5", "A", ""),
  createData("3", "211132", "Lập trình Python cơ bản (2+1*)", "3", "1.0", "7.5", "7.0", "7.2", "-", "-", "-", "7.2", "3.0", "B+", ""),
  createData("4", "921204", "Giáo dục quốc phòng và an ninh", "5", "1.0", "8.0", "8.5", "8.3", "-", "-", "-", "8.3", "3.5", "A+", ""),
  createData("5", "211214", "Công dân số (2+1*)", "3", "1.0", "9.0", "8.0", "8.5", "-", "-", "-", "8.5", "3.5", "A+", ""),
  createData("6", "911602", "Pháp luật đại cương", "2", "1.0", "8.5", "9.0", "8.7", "-", "-", "-", "8.7", "3.5", "A+", ""),
  createData("7", "131001", "Hóa học đại cương (1.5+0.5*)", "2", "1.0", "7.0", "7.5", "7.3", "-", "-", "-", "7.3", "3.0", "B+", ""),
  createData("8", "711170", "Kỹ năng mềm", "2", "1.0", "9.0", "8.5", "8.8", "-", "-", "-", "8.8", "3.5", "A+", ""),
  createData("9", "911102", "Triết học Mác - Lênin", "3", "1.0", "7.0", "7.5", "7.3", "-", "-", "-", "7.3", "3.0", "B", ""),
  createData("10", "111126", "Giải tích", "3", "1.0", "8.5", "8.0", "8.3", "-", "-", "-", "8.3", "3.5", "A+", ""),
  createData("11", "921114", "Giáo dục thể chất 2", "1", "1.0", "6.5", "7.0", "6.8", "-", "-", "-", "6.8", "2.5", "C", ""),
  createData("12", "221104", "Kiến trúc máy tính", "3", "1.0", "9.0", "9.5", "9.3", "-", "-", "-", "9.3", "4.0", "A+", ""),
  createData("13", "211002", "Cơ sở kỹ thuật lập trình (2+1*)", "3", "1.0", "9.0", "8.5", "8.8", "-", "-", "-", "8.8", "3.5", "A+", ""),
  createData("14", "231027", "Cơ sở dữ liệu", "3", "1.0", "8.0", "7.5", "7.8", "-", "-", "-", "7.8", "3.0", "B+", ""),
  createData("15", "921115", "Giáo dục thể chất 3", "1", "1.0", "7.5", "8.0", "7.8", "-", "-", "-", "7.8", "3.0", "B+", ""),
  createData("16", "211156", "Hệ quản trị cơ sở dữ liệu (2+1*)", "3", "1.0", "6.5", "7.0", "6.8", "-", "-", "-", "6.8", "2.5", "C", ""),
  createData("17", "211131", "Cấu trúc dữ liệu và giải thuật (2+1*)", "3", "1.0", "7.5", "7.0", "7.2", "-", "-", "-", "7.2", "3.0", "B+", ""),
  createData("18", "221190", "Hệ điều hành (2+1*)", "3", "1.0", "9.0", "8.5", "8.8", "-", "-", "-", "8.8", "3.5", "A+", ""),
  createData("19", "111209", "Giải tích số", "2", "1.0", "8.0", "8.5", "8.3", "-", "-", "-", "8.3", "3.5", "A", ""),
  createData("20", "211460", "Lập trình hướng đối tượng (2+1*)", "3", "1.0", "7.0", "7.5", "7.3", "-", "-", "-", "7.3", "3.0", "B+", ""),
];

export function ScoresTable() {
  return (
    <Box className="grades-student__information">
      <TableContainer className="primary-table-container" component={Paper}>
        <Table className="primary-table" aria-label="scores table">

          {/* ===== HEADER 1 ===== */}
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

            {/* ===== HEADER 2 ===== */}
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
            {rows.map((row) => (
              <TableRow key={row.index} className="primary-trow">
                <TableCell className="primary-tcell" align="center">{row.index}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.subject_code}</TableCell>
                <TableCell className="primary-tcell" align="left">{row.subject_name}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.credits}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.weight}</TableCell>

                <TableCell className="primary-tcell" align="center">{row.exam1}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.exam2}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.exam3}</TableCell>

                <TableCell className="primary-tcell" align="center">{row.recheck1}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.recheck2}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.recheck3}</TableCell>

                <TableCell className="primary-tcell" align="center">{row.avg10}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.avg4}</TableCell>
                <TableCell className="primary-tcell" align="center">{row.grade}</TableCell>

                <TableCell className="primary-tcell tcell-note" align="center">{row.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ScoresTable;
