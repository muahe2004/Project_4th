import { useState } from "react";
import { useTranslation } from "react-i18next";

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

import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import ClassForm from "../components/ClassFormModel";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";

import { useGetClasses } from "../apis/getClasses";
import { useDeleteClass } from "../apis/deleteClass";
import type { IClassesResponse } from "../types";

import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import { getStatusOptions } from "../../../utils/status/status-i18n";
import { STATUS } from "../../../constants/status";

import "./styles/Classes.css";
import { useSpecializationsDropDown } from "../../specializations/apis/getSpecializationDropDown";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";

export function Classes() {
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [search, setSearch] = useState("");
    const [searchSpecialization, setSearchSpecialization] = useState("");

    const [status, setStatus] = useState(STATUS.ACTIVE);
    const [specializationId, setSpecializationId] = useState("");

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedClass, setSelectedClass] = useState<IClassesResponse>();
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined);

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
        ...(specializationId && { specialization_id: specializationId }),
    };

    const ParamsSpecialization = {
        limit: 5,
        skip: 0,
        search: searchSpecialization || undefined,
    };

    const {
        data: classes,
        isLoading: isLoadingClasses,
        error: errorClasses,
    } = useGetClasses(Params);

    const {
        data: specializations,
        isLoading: isLoadingSpecializations,
        error: errorSpecializations,
    } = useSpecializationsDropDown(ParamsSpecialization);
    const specializationOptions = Array.isArray(specializations) ? specializations : [];
    const { mutateAsync: deleteClass } = useDeleteClass({});

    const handleDeleteClass = (classItem?: IClassesResponse) => {
        if (!classItem?.id) {
            return;
        }

        setPendingDeleteId(classItem.id);
        setOpenDeleteConfirm(true);
    };

    const confirmDeleteClass = async () => {
        if (!pendingDeleteId) {
            setOpenDeleteConfirm(false);
            return;
        }

        try {
            const response = await deleteClass(pendingDeleteId);
            showSnackbar(t(response.message || "classes.messages.deleteSuccess"), "success");
        } catch (error: any) {
            const detailKey = error?.response?.data?.detail ?? "classes.messages.deleteFailed";
            const detail = t(detailKey);
            showSnackbar(detail, "error");
        } finally {
            setOpenDeleteConfirm(false);
            setPendingDeleteId(undefined);
        }
    };

    return (
        <main className="admin-main-container">
            <BreadCrumb
                className="department-breadcrumb"
                items={[
                    { label: t("common.dashboard"), to: dashBoardUrl },
                    { label: t("classes.title") },
                ]}
            />
            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={getStatusOptions()}
                />

                <MainAutocomplete
                    options={specializationOptions}
                    value={specializationId ? specializationId : ""} 
                    onChange={(id) => {
                        setSpecializationId(id); 
                        setPage(1); 
                        setSearchSpecialization("");
                    }}
                    onSearchChange={setSearchSpecialization} 
                    onResetPage={() => setPage(1)} 
                    getOptionLabel={(option) => option.name}
                    getOptionId={(option) => option.id?.toString() || ""} 
                    placeholder={t("classes.filters.specialization")}
                    className="classes-filter__specialization"
                />

                <SearchEngine 
                    placeholder={t("classes.searchPlaceholder")} 
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
                    {t("classes.addClass")}
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
                                {t("classes.table.classCode")}
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                {t("classes.table.className")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("classes.table.size")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("classes.table.teacher")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("classes.table.specialization")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("classes.table.status")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("common.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="sticky-tbody">
                        {(classes?.data ?? []).map((row) => (
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
                                            setSelectedClass(row);
                                            setOpen(true);
                                        }}
                                    >
                                        <EditSquareIcon/>
                                    </IconButton>
                                    <IconButton
                                        className="primary-tcell__button--icon primary-tcell__button--delete"
                                        onClick={() => handleDeleteClass(row)}
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
                totalItems={classes?.total || 0}
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
                initialValues={selectedClass}
                onClose={() => setOpen(false)}
            />

            <ConfirmDialog
                open={openDeleteConfirm}
                title={t("classes.confirmDelete.title")}
                message={t("classes.confirmDelete.message")}
                confirmLabel={t("classes.common.delete")}
                cancelLabel={t("classes.common.cancel")}
                onConfirm={() => void confirmDeleteClass()}
                onCancel={() => {
                    setOpenDeleteConfirm(false);
                    setPendingDeleteId(undefined);
                }}
            />
        </main>
    );
}

export default Classes;
