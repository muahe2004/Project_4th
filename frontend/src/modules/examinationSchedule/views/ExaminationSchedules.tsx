import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
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
import WeekPicker from "../../../components/WeekPicker/WeekPicker";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useGetExaminationSchedules } from "../apis/getExaminationSchedule";
import { useDeleteExaminationSchedule } from "../apis/deleteExaminationSchedule";
import ExaminationScheduleFormModel from "../components/ExaminationScheduleFormModel";
import ExaminationScheduleByClass from "../components/ExaminationScheduleByClass";
import ExaminationScheduleTable from "../components/ExaminationScheduleTable";
import ImportFormModel from "../components/ImportFormModel";
import { useUploadExaminationSchedule } from "../apis/uploadExaminationSchedule";
import { useImportExaminationSchedule } from "../apis/importExaminationSchedule";
import type {
    IExaminationScheduleResponse,
    IUploadExaminationScheduleResponse,
} from "../types";
import { getWeekDateRange } from "../../../utils/date/weekRange";


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
    const [viewMode, setViewMode] = useState<"table" | "class">("table");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [openImportFormModel, setOpenImportFormModel] = useState(false);
    const [importPreview, setImportPreview] = useState<IUploadExaminationScheduleResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { showSnackbar } = useSnackbar();
    const deleteExaminationScheduleMutation = useDeleteExaminationSchedule();
    const { mutateAsync: uploadExaminationScheduleFile, isPending: isUploadingExaminationScheduleFile } =
        useUploadExaminationSchedule({});
    const { mutateAsync: importExaminationSchedule, isPending: isImportingExaminationSchedule } =
        useImportExaminationSchedule({});
    const dateRange = useMemo(() => getWeekDateRange(selectedDate), [selectedDate]);

    const params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
        ...dateRange,
    };

    const { data: examinationSchedules, isLoading } = useGetExaminationSchedules(params);

    const handleOpenImportFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleImportExaminationScheduleFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        try {
            const uploadedResult = await uploadExaminationScheduleFile(selectedFile);
            setImportPreview(uploadedResult);
            setOpenImportFormModel(true);
        } catch (error: any) {
            const detail = error?.response?.data?.detail ?? "Upload file lịch thi thất bại";
            showSnackbar(detail, "error");
            setImportPreview(null);
            setOpenImportFormModel(false);
        } finally {
            event.target.value = "";
        }
    };

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
                <Button
                    onClick={() => {
                        setViewMode((current) =>
                            current === "table" ? "class" : "table"
                        );
                    }}
                    className="btn-spacing-left">
                    {viewMode === "table" ? "Class UI" : "Table UI"}
                </Button>
                <Button
                    onClick={handleOpenImportFilePicker}
                    disabled={isUploadingExaminationScheduleFile}
                    className="btn-spacing-left"
                >
                    {isUploadingExaminationScheduleFile ? "Uploading..." : "Import lịch thi"}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    style={{ display: "none" }}
                    onChange={handleImportExaminationScheduleFile}
                />
            </Box>

            <WeekPicker
                selectedDate={selectedDate}
                onChangeDate={(date) => {
                    setSelectedDate(date);
                    setPage(1);
                }}
            />

            {viewMode === "table" ? (
                <ExaminationScheduleTable
                    examinationSchedules={examinationSchedules}
                    onEdit={handleOpenEditForm}
                    onDelete={handleRequestDelete}
                />
            ) : (
                <ExaminationScheduleByClass
                    search={search}
                    status={status}
                    selectedDate={selectedDate}
                />
            )}

            {viewMode === "table" && (
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
            )}

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

            <ImportFormModel
                open={openImportFormModel}
                onClose={() => setOpenImportFormModel(false)}
                data={importPreview}
                isImporting={isImportingExaminationSchedule}
                onImport={async (payload) => {
                    try {
                        const response = await importExaminationSchedule(payload);
                        showSnackbar(
                            response?.items?.length
                                ? `Import lịch thi thành công (${response.items.length} dòng)`
                                : "Import lịch thi thành công",
                            "success"
                        );
                        setOpenImportFormModel(false);
                        setImportPreview(null);
                    } catch (error: any) {
                        const detail = error?.response?.data?.detail ?? "Import lịch thi thất bại";
                        showSnackbar(detail, "error");
                    }
                }}
            />
        </main>
    )
}
