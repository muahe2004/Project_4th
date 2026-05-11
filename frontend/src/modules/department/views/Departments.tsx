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
import { useTranslation } from "react-i18next";

export function Departments() {
    const { t } = useTranslation();
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
            showSnackbar(t("departments.messages.missingId"), "error");
            return;
        }

        if (!window.confirm(t("departments.confirmDelete"))) {
            return;
        }

        deleteDepartmentMutation.mutate(departmentId, {
            onSuccess: () => {
                showSnackbar(t("departments.messages.deleteSuccess"), "success");
            },
            onError: (error: any) => {
                const detail = error?.response?.data?.detail ?? t("departments.messages.deleteFailed");
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
                    { label: t("departments.breadcrumb.dashboard"), to: dashBoardUrl },
                    { label: t("departments.breadcrumb.title") },
                ]}
            />
            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                />
                
                <SearchEngine 
                    placeholder={t("departments.searchPlaceholder")}
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
                    {t("departments.addDepartment")}
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
                                {t("departments.table.departmentCode")}
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                {t("departments.table.departmentName")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("departments.table.establishedDate")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("departments.table.status")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("departments.table.actions")}
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
