import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";

import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from "@mui/icons-material/Delete";
import type { IStudentsResponse } from "../types";
import { useEffect } from "react";
import { getGenderDisplay } from "../../../utils/status/gender-display";

interface StudentTableProps {
    students?: {
        data: IStudentsResponse[];
        total: number;
    };
    onEdit?: (student: IStudentsResponse) => void;
    onDelete?: (student: IStudentsResponse) => void;
}


export const StudentTable = ({ students, onEdit, onDelete }: StudentTableProps) => {

    useEffect(() => {
        console.log(students);
    }, [students])
    
    return(
        <TableContainer
            className="sticky-table-container"
            component={Paper}
        >
            <Table stickyHeader className="sticky-table" aria-label="departments table">
                <TableHead className="primary-thead">
                    <TableRow className="primary-trow">
                        <TableCell className="primary-thead__cell" align="center">
                            Mã sinh viên
                        </TableCell>
                        <TableCell className="primary-thead__cell department-name-tcell" align="center">
                            Tên sinh viên
                        </TableCell>
                        <TableCell className="primary-thead__cell" align="center">
                            Email
                        </TableCell>
                        <TableCell className="primary-thead__cell" align="center">
                            Giới tính
                        </TableCell>
                        <TableCell className="primary-thead__cell" align="center">
                            Lớp
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
                    {students?.data.map((row) => (
                        <TableRow key={row.student_code} className="sticky-trow">
                            <TableCell  className="sticky-tcell" align="center">
                                {row.student_code}
                            </TableCell>
                            <TableCell className="sticky-tcell" align="left">
                                {row.name}
                            </TableCell>
                            <TableCell className="sticky-tcell" align="left">
                                {/* {dayjs(row.established_date).format("DD-MM-YYYY")} */}
                                {row.email}
                            </TableCell>
                            <TableCell className="sticky-tcell" align="center">
                                {getGenderDisplay(row.gender)}
                            </TableCell>
                            <TableCell className="sticky-tcell" align="left">
                                {row.class_name}
                            </TableCell>
                            <TableCell className="sticky-tcell" align="center" sx={{ color: getStatusColor(row.status)}}>
                                {getStatusDisplay(row.status)}
                            </TableCell>
                            <TableCell className="sticky-tcell" align="center">
                                <IconButton 
                                    className="primary-tcell__button--icon" 
                                    onClick={() => {
                                        onEdit?.(row);
                                    }}
                                >
                                    <EditSquareIcon/>
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
    )
}