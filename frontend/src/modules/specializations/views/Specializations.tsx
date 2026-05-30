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
import SpecializationForm from "../components/SpecializationFormModel";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";

import { getStatusColor } from "../../../utils/status/status-color";
import { getStatusDisplay } from "../../../utils/status/status-display";
import { getStatusOptions } from "../../../utils/status/status-i18n";

import { useGetSpecialization } from "../apis/getSpecializations";
import type { ISpecializations } from "../types";

import "./styles/Specializations.css";
import { useGetMajor } from "../../majors/apis/getMajors";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useDeleteSpecialization } from "../apis/deleteSpecialization";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";

export function Specializations() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchMajor, setSearchMajor] = useState("");

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedMajor, setSelectedMajor] = useState<ISpecializations | undefined>(undefined); 
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined);

    const [majorId, setMajorId] = useState("");
    const [status, setStatus] = useState("");

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const { showSnackbar } = useSnackbar();
    const deleteSpecializationMutation = useDeleteSpecialization();

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
        ...(majorId && { major_id: majorId }),
    };

    const { data: specializations } = useGetSpecialization(Params);

    const ParamsMajor = {
        limit: 5,
        skip: (page - 1) * 5,
        search: searchMajor || undefined
    };
    
    const { data: major } = useGetMajor(ParamsMajor);
    const handleDeleteSpecialization = (id?: string) => {
        if (!id) {
            showSnackbar(t("specializations.messages.missingId"), "error");
            return;
        }

        setPendingDeleteId(id);
        setOpenDeleteConfirm(true);
    };

    const confirmDeleteSpecialization = () => {
        if (!pendingDeleteId) {
            setOpenDeleteConfirm(false);
            return;
        }

        deleteSpecializationMutation.mutate(pendingDeleteId, {
            onSuccess: () => {
                showSnackbar(t("specializations.messages.deleteSuccess"), "success");
            },
            onError: (error: any) => {
                const detail = error?.response?.data?.detail ?? t("specializations.messages.deleteFailed");
                showSnackbar(detail, "error");
            },
            onSettled: () => {
                setOpenDeleteConfirm(false);
                setPendingDeleteId(undefined);
            },
        });
    };

    return (
        <main className="admin-main-container">
            <BreadCrumb
                className="department-breadcrumb"
                items={[
                    { label: t("specializations.breadcrumb.dashboard"), to: dashBoardUrl },
                    { label: t("specializations.breadcrumb.title") },
                ]}
            />
            
            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={getStatusOptions()}
                />

                <MainAutocomplete
                    options={major?.data || []}
                    value={majorId}
                    onChange={setMajorId}
                    onSearchChange={setSearchMajor}
                    onResetPage={() => setPage(1)}
                    getOptionLabel={(option) => option.name}
                    getOptionId={(option) => (option.id?.toString() || "")}
                    placeholder={t("specializations.majorFilterPlaceholder")}
                    className="specialization-filter__major"
                />

                <SearchEngine 
                    placeholder={t("specializations.searchPlaceholder")}
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
                    {t("specializations.addSpecialization")}
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
                                {t("specializations.table.specializationCode")}
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                {t("specializations.table.specializationName")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("specializations.table.establishedDate")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("specializations.table.status")}
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                {t("specializations.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="sticky-tbody">
                        {(specializations?.data ?? []).map((row) => (
                            <TableRow key={row.id} className="sticky-trow">
                                <TableCell  className="sticky-tcell" align="center">
                                    {row.specialization_code}
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
                                        onClick={() => handleDeleteSpecialization(row.id)}
                                        // disabled={deleteSpecializationMutation.isLoading}
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
                totalItems={specializations?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(p) => setPage(p)}
                onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setPage(1); 
            }}
            ></PaginationUniCore>

            <SpecializationForm 
                open={open} 
                mode={mode} 
                initialValues={selectedMajor}
                onClose={() => setOpen(false)}
            />

            <ConfirmDialog
                open={openDeleteConfirm}
                message={t("specializations.confirmDelete")}
                confirmLabel={t("specializations.common.delete", "Xóa")}
                cancelLabel={t("specializations.common.cancel")}
                onConfirm={confirmDeleteSpecialization}
                onCancel={() => {
                    setOpenDeleteConfirm(false);
                    setPendingDeleteId(undefined);
                }}
            />
        </main>
    );
}

export default Specializations;
