import { useState } from "react";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import { Box } from "@mui/material";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { STATUS_OPTIONS } from "../../../constants/status";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useGetExaminationSchedules } from "../apis/getExaminationSchedule";
import { useDeleteExaminationSchedule } from "../apis/deleteExaminationSchedule";
import ExaminationScheduleFormModel from "../components/ExaminationScheduleFormModel";
import ExaminationScheduleTable from "../components/ExaminationScheduleTable";
import type { IExaminationScheduleResponse } from "../types";


export function ExaminationSchedules() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedExaminationSchedule, setSelectedExaminationSchedule] =
        useState<IExaminationScheduleResponse | undefined>(undefined);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [pendingDeleteSchedule, setPendingDeleteSchedule] =
        useState<IExaminationScheduleResponse | undefined>(undefined);

    const { showSnackbar } = useSnackbar();
    const deleteExaminationScheduleMutation = useDeleteExaminationSchedule();

    const params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
    };

    const { data: examinationSchedules, isLoading } = useGetExaminationSchedules(params);

    const handleOpenAddForm = () => {
        setMode("add");
        setSelectedExaminationSchedule(undefined);
        setOpenForm(true);
    };

    const handleOpenEditForm = (schedule: IExaminationScheduleResponse) => {
        setMode("edit");
        setSelectedExaminationSchedule(schedule);
        setOpenForm(true);
    };

    const handleRequestDelete = (schedule: IExaminationScheduleResponse) => {
        setPendingDeleteSchedule(schedule);
        setOpenDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (!pendingDeleteSchedule?.id) {
            showSnackbar("Không tìm thấy lịch thi để xoá", "error");
            setOpenDeleteConfirm(false);
            return;
        }

        deleteExaminationScheduleMutation.mutate(pendingDeleteSchedule.id, {
            onSuccess: (response) => {
                showSnackbar(response?.message ?? "Xoá lịch thi thành công", "success");
                setOpenDeleteConfirm(false);
                setPendingDeleteSchedule(undefined);
            },
            onError: (error: any) => {
                const detail = error?.response?.data?.detail ?? "Xoá lịch thi thất bại";
                showSnackbar(detail, "error");
            },
        });
    };

    if (isLoading) {
        return (
            <main className="admin-main-container">
                <Loading />
            </main>
        );
    }

    return(
        <main className="admin-main-container">
            <BreadCrumb
                className="students-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "ExaminationSchedules" },
                ]}
            />

            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                />
                
                <SearchEngine 
                    placeholder="Tìm theo lớp, môn, phòng..."
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                />
                <Button
                    onClick={handleOpenAddForm}
                    className="btn-spacing-left">
                    Add Examination Schedule
                </Button>
            </Box>

            <ExaminationScheduleTable
                examinationSchedules={examinationSchedules}
                onEdit={handleOpenEditForm}
                onDelete={handleRequestDelete}
            />

            <PaginationUniCore
                totalItems={examinationSchedules?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(p) => setPage(p)}
                onRowsPerPageChange={(r) => {
                    setRowsPerPage(r);
                    setPage(1);
                }}
            ></PaginationUniCore>

            <ExaminationScheduleFormModel
                open={openForm}
                mode={mode}
                initialValues={selectedExaminationSchedule}
                onClose={() => setOpenForm(false)}
            />

            <ConfirmDialog
                open={openDeleteConfirm}
                title="Xác nhận xoá"
                message="Bạn có chắc muốn xoá lịch thi này không?"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setOpenDeleteConfirm(false);
                    setPendingDeleteSchedule(undefined);
                }}
            />
        </main>
    )
}
