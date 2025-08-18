import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';


import "./styles/StudentInformation.css";

function createData(
  name: string,
  student_code: string,
  class_code: string,
  training_program: string,
  course: string

) {
  return { name, student_code, class_code, training_program, course };
}

const rows = [
  createData('Lý Văn Minh', "10122256", "12522W.2KS", "Đại học chính quy", "2022 - 2026"),
];

export function StudentInformation() {
    const { t } = useTranslation();
  
    return (
        <Box className="grades-student__information">
            <TableContainer className="primary-table-container" component={Paper}>
                <Table className="primary-table" aria-label="simple table">
                    <TableHead className="primary-thead">
                        <TableRow className="primary-trow">
                            <TableCell className="primary-thead__cell" align="left">Họ và tên sinh viên</TableCell>
                            <TableCell className="primary-thead__cell" align="left">Mã sinh viên</TableCell>
                            <TableCell className="primary-thead__cell" align="left">Mã lớp</TableCell>
                            <TableCell className="primary-thead__cell" align="center">Chương trình đào tạo</TableCell>
                            <TableCell className="primary-thead__cell" align="center">Niên khoá</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="primary-tbody">
                        {rows.map((row) => (
                            <TableRow
                                key={row.name}
                                className="primary-trow"
                            >
                                <TableCell className="primary-tcell" align="left">{row.name}</TableCell>
                                <TableCell className="primary-tcell" align="left">{row.student_code}</TableCell>
                                <TableCell className="primary-tcell" align="left">{row.class_code}</TableCell>
                                <TableCell className="primary-tcell" align="center">{row.training_program}</TableCell>
                                <TableCell className="primary-tcell" align="center">{row.course}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default StudentInformation;
