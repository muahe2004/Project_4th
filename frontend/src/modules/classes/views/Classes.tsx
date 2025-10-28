import { useState } from "react";
import dayjs from "dayjs";

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
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import Button from "../../../components/Button/Button";
import ClassForm from "../components/ClassFormModel";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";

import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import { STATUS_OPTIONS } from "../../../constants/status";

import { useGetClasses } from "../apis/getClasses";
import type { IClasses } from "../types";

import "./styles/Specializations.css";
import { useGetMajor } from "../../majors/apis/getMajors";

export function Classes() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchMajor, setSearchMajor] = useState("");

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedMajor, setSelectedMajor] = useState<IClasses | undefined>(undefined); 

    const [majorId, setMajorId] = useState("");
    const [status, setStatus] = useState("");

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
        ...(majorId && { major_id: majorId }),
    };

    const { data: classes, isLoading: isLoadingClasses, error: errorClasses } = useGetClasses(Params);

    const ParamsMajor = {
        limit: 5,
        skip: (page - 1) * 5,
        search: searchMajor || undefined
    };
    
    const { data: major, isLoading: isLoadingDeparment, error: errorDepatment } = useGetMajor(ParamsMajor);

    return (
        <main className="admin-main-container">
            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                />

                <MainAutocomplete
                    options={major?.data || []}
                    value={majorId}
                    onChange={setMajorId}
                    onSearchChange={setSearchMajor}
                    onResetPage={() => setPage(1)}
                    getOptionLabel={(option) => option.name}
                    getOptionId={(option) => (option.id?.toString() || "")}
                    placeholder="Lọc theo chuyên ngành"
                />

                <SearchEngine 
                    placeholder="Tìm theo tên lớp, mã lớp..." 
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
                    className="btn-spacing-left">
                    Add CLASS
                </Button>
            </Box>

            <TableContainer
                className="sticky-table-container"
                component={Paper}
            >
                <Table stickyHeader className="sticky-table" aria-label="majors table">
                    <TableHead className="primary-thead">
                        <TableRow className="primary-trow">
                            <TableCell className="primary-thead__cell" align="center">
                                Mã lớp
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                Tên lớp
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Sĩ số
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Chủ nhiệm
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Chuyên ngành
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
                        {classes?.data.map((row) => (
                            <TableRow key={row.id} className="sticky-trow">
                                <TableCell  className="sticky-tcell" align="center">
                                    {row.class_code}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.class_name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.size}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.teacher_name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.specialization_name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center" sx={{ color: getStatusColor(row.status)}}>
                                    {getStatusDisplay(row.status)}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    <IconButton 
                                        className="primary-tcell__button--icon" 
                                        onClick={() => {
                                            setMode("edit");
                                            setSelectedMajor(row);
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

            <ClassForm 
                open={open} 
                mode={mode} 
                initialValues={selectedMajor}
                onClose={() => setOpen(false)}
            />
        </main>
    );
}

export default Classes;