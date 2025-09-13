import PaginationUniCore from "../../../components/Pagination/Pagination";
import "./styles/Department.css";
import {
    Box,
    IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import Button from "../../../components/Button/Button";
import { useEffect, useState } from "react";
import DepartmentForm from "../components/DepartmentFormModel";
import { useGetDepartment } from "../apis/getDepartments";
import dayjs from "dayjs";
import Loading from "../../../components/Loading/Loading";
import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";

export function Departments() {
    const [page, setPage] = useState(1);


    const searchDepartment = (value: string) => {
        console.log("value: ", value);
    }

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        // Cần bổ sung thêm search
    };

    const { data: department, isLoading: isLoadingDeparment, error: errorDepatment } = useGetDepartment(Params);

    const isLoading = isLoadingDeparment;

    return (
        <main className="departments">
            {
                isLoading && (<Loading></Loading>)
            }
            
            <Box className="departments-box">
                <SearchEngine 
                    placeholder="Tìm khoa..." 
                    onSearch={(val) => {
                        searchDepartment(val);
                    }} 
                />
                <Button
                    onClick={() => {
                        setMode("add");
                        setOpen(true);
                    }}
                    className="departments-button__add">
                    Add Department
                </Button>
            </Box>

            <TableContainer
                className="sticky-table-container"
                component={Paper}
            >
                <Table stickyHeader className="sticky-table" aria-label="departments table">
                    <TableHead className="primary-thead">
                        <TableRow className="primary-trow">
                            <TableCell className="primary-thead__cell" align="center">
                                Mã khoa
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                Tên khoa
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Ngày thành lập
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
                        {department?.data.map((row) => (
                            <TableRow key={row.id} className="sticky-trow">
                                <TableCell  className="sticky-tcell" align="center">
                                    {row.department_code}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    {dayjs(row.established_date).format("DD-MM-YYYY")}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center" sx={{ color: getStatusColor(row.status)}}>
                                    {getStatusDisplay(row.status)}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    <IconButton className="primary-tcell__button--icon" >
                                        <EditSquareIcon/>
                                    </IconButton>
                                    <IconButton className="primary-tcell__button--icon primary-tcell__button--delete">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <PaginationUniCore
                totalItems={department?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(p) => setPage(p)}
                onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setPage(1); 
            }}
            ></PaginationUniCore>

            <DepartmentForm 
                open={open} 
                mode={mode} 
                onClose={() => setOpen(false)} 
                onSubmit={(values) => {
                console.log("Submit:", values);
                }} 
            />
        </main>
    );
}

export default Departments;