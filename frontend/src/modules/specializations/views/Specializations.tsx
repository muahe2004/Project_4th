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
import { STATUS_OPTIONS } from "../../../constants/status";

import { useGetSpecialization } from "../apis/getSpecializations";
import type { ISpecializations } from "../types";

import "./styles/Specializations.css";
import { useGetMajor } from "../../majors/apis/getMajors";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useDeleteSpecialization } from "../apis/deleteSpecialization";

export function Specializations() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchMajor, setSearchMajor] = useState("");

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedMajor, setSelectedMajor] = useState<ISpecializations | undefined>(undefined); 

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
            showSnackbar("Không tìm thấy mã chuyên ngành để xoá", "error");
            return;
        }

        if (!window.confirm("Bạn có chắc muốn xoá chuyên ngành này không?")) {
            return;
        }

        deleteSpecializationMutation.mutate(id, {
            onSuccess: () => {
                showSnackbar("Xoá chuyên ngành thành công", "success");
            },
            onError: (error: any) => {
                const detail = error?.response?.data?.detail ?? "Xoá chuyên ngành thất bại";
                showSnackbar(detail, "error");
            },
        });
    };

    return (
        <main className="admin-main-container">
            <BreadCrumb
                className="department-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "Specializations" },
                ]}
            />
            
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
                    placeholder="Lọc theo ngành"
                />

                <SearchEngine 
                    placeholder="Tìm theo tên chuyên ngành, mã chuyên ngành..." 
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
                    Add SPECIALIZATION
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
                                Mã chuyên ngành
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                Tên chuyên ngành
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
                        {specializations?.data.map((row) => (
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
                totalItems={major?.total || 0}
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
        </main>
    );
}

export default Specializations;
