import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Paper from "@mui/material/Paper";

function createData(
  day: string,
  periods: string,
  code: string,
  subject: string,
  classId: string,
  room: string,
  teacher: string
) {
  return { day, periods, code, subject, classId, room, teacher };
}

const rows = [
  createData("4", "1 - 4", "211127", "Phát triển ứng dụng Mobile đa nền tảng (2+1*)", "10122256", "302", "Nguyen Van A"),
  createData("4", "7 - 11", "211127", "Phát triển ứng dụng Mobile đa nền tảng (2+1*)", "10122256", "302", "Nguyen Van A"),
  createData("5", "8 - 11", "931168", "Đại cương về Kinh tế môi trường", "10111111", "201", "Tran Thi B"),
  createData("6", "1 - 4", "221180", "Học máy cơ bản", "10133333", "401", "Le Van C"),
  createData("7", "7 - 10", "215687", "Tiếng anh cho CNTT", "10144444", "502", "Pham Thi D"),
];

export function LearningScheduleTable() {
    return (
        <Box className="student-tableScore">
            <TableContainer className="primary-table-container" component={Paper}>
                <Table className="primary-table" aria-label="student schedule table">
                    <TableHead className="primary-thead">
                        <TableRow className="primary-trow">
                        <TableCell className="primary-thead__cell" align="center">Thứ</TableCell>
                        <TableCell className="primary-thead__cell" align="center">Tiết</TableCell>
                        <TableCell className="primary-thead__cell" align="center">Mã môn</TableCell>
                        <TableCell className="primary-thead__cell" align="center">Tên môn</TableCell>
                        <TableCell className="primary-thead__cell" align="center">Lớp học phần</TableCell>
                        <TableCell className="primary-thead__cell" align="center">Phòng học</TableCell>
                        <TableCell className="primary-thead__cell" align="center">Giảng viên</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="primary-tbody">
                        {rows.map((row, index) => (
                        <TableRow key={index} className="primary-trow">
                            <TableCell className="primary-tcell" align="center">{row.day}</TableCell>
                            <TableCell className="primary-tcell" align="center">{row.periods}</TableCell>
                            <TableCell className="primary-tcell" align="center">{row.code}</TableCell>
                            <TableCell className="primary-tcell" align="left">{row.subject}</TableCell>
                            <TableCell className="primary-tcell" align="center">{row.classId}</TableCell>
                            <TableCell className="primary-tcell" align="center">{row.room}</TableCell>
                            <TableCell className="primary-tcell" align="center">{row.teacher}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default LearningScheduleTable;
