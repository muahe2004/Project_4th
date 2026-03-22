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
import { useState } from "react";
import DepartmentForm from "../components/DepartmentFormModel";
import { useGetDepartment } from "../apis/getDepartments";
import dayjs from "dayjs";
import Loading from "../../../components/Loading/Loading";
import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import type { IDepartments } from "../types";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import { STATUS_OPTIONS } from "../../../constants/status";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useDeleteDepartment } from "../apis/deleteDepartment";

export function Departments() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const { showSnackbar } = useSnackbar();
    const deleteDepartmentMutation = useDeleteDepartment();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedDepartment, setSelectedDepartment] = useState<IDepartments | undefined>(undefined); 

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
    };

    const { data: department, isLoading: isLoadingDeparment } = useGetDepartment(Params);

    const isLoading = isLoadingDeparment;

    const handleDeleteDepartment = (departmentId?: string) => {
        if (!departmentId) {
            showSnackbar("Không tìm thấy mã khoa để xoá", "error");
            return;
        }

        if (!window.confirm("Bạn có chắc muốn xoá khoa này không?")) {
            return;
        }

        deleteDepartmentMutation.mutate(departmentId, {
            onSuccess: () => {
                showSnackbar("Xoá khoa thành công", "success");
            },
            onError: (error: any) => {
                const detail = error?.response?.data?.detail ?? "Xoá khoa thất bại";
                showSnackbar(detail, "error");
            }
        });
    };

    if (isLoading) {
        return (
            <main className="admin-main-container">
                <Loading />
            </main>
        );
    }

    return (
        <main className="admin-main-container">
            <BreadCrumb
                className="department-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "Departments" },
                ]}
            />
            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                />
                
                <SearchEngine 
                    placeholder="Tìm theo tên khoa, mã " 
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
                        {(department?.data ?? []).map((row) => (
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
                                    <IconButton 
                                        className="primary-tcell__button--icon primary-tcell__button--delete"
                                        onClick={() => handleDeleteDepartment(row.id)}
                                        // disabled={deleteDepartmentMutation.isLoading}
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
                initialValues={selectedDepartment}
                onClose={() => setOpen(false)}
            />
        </main>
    );
}

export default Departments;
