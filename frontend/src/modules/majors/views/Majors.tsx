import PaginationUniCore from "../../../components/Pagination/Pagination";
import "./styles/Majors.css";
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
// import DepartmentForm from "../components/DepartmentFormModel";
// import { useGetDepartment } from "../apis/getDepartments";
import dayjs from "dayjs";
import Loading from "../../../components/Loading/Loading";
import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import type { IMajors } from "../types";
import { useGetMajor } from "../apis/getMajors";
import MajorForm from "../components/MajorFormModel";

export function Majors() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const searchDepartment = (value: string) => {
        console.log("value: ", value);
    }

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedDepartment, setSelectedDepartment] = useState<IMajors | undefined>(undefined); 

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        search: search || undefined
    };

    const { data: major, isLoading: isLoadingMajor, error: errorMajor } = useGetMajor(Params);

    const isLoading = isLoadingMajor;

    return (
        <main className="departments">
            {
                isLoading && (<Loading></Loading>)
            }
            
            <Box className="departments-box">
                <SearchEngine 
                    placeholder="Tìm theo tên ngành, mã ngành..." 
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                />
                <Button
                    onClick={() => {
                        setMode("add");
                        setOpen(true);
                    }}
                    className="departments-button__add">
                    Add Major
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
                                Mã ngành
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                Tên ngành
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
                        {major?.data.map((row) => (
                            <TableRow key={row.id} className="sticky-trow">
                                <TableCell  className="sticky-tcell" align="center">
                                    {row.major_code}
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
                                    <IconButton 
                                        className="primary-tcell__button--icon" 
                                        onClick={() => {
                                            setMode("edit");
                                            setSelectedDepartment(row);
                                            setOpen(true);
                                        }}
                                    >
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
                totalItems={major?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(p) => setPage(p)}
                onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setPage(1); 
            }}
            ></PaginationUniCore>

            <MajorForm 
                open={open} 
                mode={mode} 
                initialValues={selectedDepartment}
                onClose={() => setOpen(false)}
            />
        </main>
    );
}

export default Majors;