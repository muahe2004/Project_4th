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
import MajorForm from "../components/MajorFormModel";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";

import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import { STATUS_OPTIONS } from "../../../constants/status";

import { useGetMajor } from "../apis/getMajors";
import { useGetDepartment } from "../../department/apis/getDepartments";
import type { IMajors } from "../types";

import "./styles/Majors.css";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useDeleteMajor } from "../apis/deleteMajor";

export function Majors() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchDepartment, setSearchDepartment] = useState("");

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedMajor, setSelectedMajor] = useState<IMajors | undefined>(undefined); 

    const [departmentId, setDepartmentId] = useState("");
    const [status, setStatus] = useState("");

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const { showSnackbar } = useSnackbar();
    const deleteMajorMutation = useDeleteMajor();

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
        ...(departmentId && { department_id: departmentId }),
    };

    const { data: major } = useGetMajor(Params);

    const handleDeleteMajor = (majorId?: string) => {
        if (!majorId) {
            showSnackbar("Không tìm thấy mã ngành để xoá", "error");
            return;
        }

        if (!window.confirm("Bạn có chắc muốn xoá ngành này không?")) {
            return;
        }

        deleteMajorMutation.mutate(majorId, {
            onSuccess: () => {
                showSnackbar("Xoá ngành thành công", "success");
            },
            onError: (error: any) => {
                const detail = error?.response?.data?.detail ?? "Xoá ngành thất bại";
                showSnackbar(detail, "error");
            },
        });
    };

    const ParamsDepartment = {
        limit: 5,
        skip: (page - 1) * 5,
        search: searchDepartment || undefined
    };
    
    const { data: department } = useGetDepartment(ParamsDepartment);

    return (
        <main className="admin-main-container">
            <BreadCrumb
                className="department-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "Majors" },
                ]}
            />
            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                />

                <MainAutocomplete
                    options={department?.data || []}
                    value={departmentId}
                    onChange={setDepartmentId}
                    onSearchChange={setSearchDepartment}
                    onResetPage={() => setPage(1)}
                    getOptionLabel={(option) => option.name}
                    getOptionId={(option) => (option.id?.toString() || "")}
                    placeholder="Lọc theo khoa"
                />

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
                    className="btn-spacing-left">
                    Add Major
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
                        {(major?.data ?? []).map((row) => (
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
                                            setSelectedMajor(row);
                                            setOpen(true);
                                        }}
                                    >
                                        <EditSquareIcon/>
                                    </IconButton>
                                    <IconButton
                                        className="primary-tcell__button--icon primary-tcell__button--delete"
                                        onClick={() => handleDeleteMajor(row.id)}
                                        // disabled={deleteMajorMutation.isLoading}
                                    >
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
                initialValues={selectedMajor}
                onClose={() => setOpen(false)}
            />
        </main>
    );
}

export default Majors;
