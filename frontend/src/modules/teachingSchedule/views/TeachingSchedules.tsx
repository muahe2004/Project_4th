import { useState } from "react";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import { Box } from "@mui/material";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { STATUS_OPTIONS } from "../../../constants/status";
import Loading from "../../../components/Loading/Loading";
import { useGetTeachingSchedules } from "../apis/getTeachingSchedules";
import TeachingSchedulesTable from "../components/TeachingSchedulesTable";
import TeachingScheduleByRoom from "../components/TeachingScheduleByRoom";
import TeachingScheduleByTeacher from "../components/TeachingScheduleByTeacher";
import TeachingScheduleByClass from "../components/TeachingScheduleByClass";
import Button from "../../../components/Button/Button";
import TeachingSchedulesFormModel from "../components/TeachingSchedulesFormModel";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useDeleteTeachingSchedule } from "../apis/deleteTeachingSchedules";
import type { ITeachingScheduleResponse } from "../types";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";

export function TeachingSchedules() {
  const { showSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [scheduleView, setScheduleView] = useState<"table" | "room" | "teacher" | "class">("table");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedTeachingSchedule, setSelectedTeachingSchedule] = useState<
    ITeachingScheduleResponse | undefined
  >(undefined);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deletingTeachingSchedule, setDeletingTeachingSchedule] = useState<
    ITeachingScheduleResponse | undefined
  >(undefined);
  const isTableView = scheduleView === "table";

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
  };

  const { data: teachingSchedules, isLoading } = useGetTeachingSchedules(
    params,
    isTableView
  );
  const deleteTeachingScheduleMutation = useDeleteTeachingSchedule();

  const handleOpenAddForm = () => {
    setFormMode("add");
    setSelectedTeachingSchedule(undefined);
    setOpenForm(true);
  };

  const handleOpenEditForm = (teachingSchedule: ITeachingScheduleResponse) => {
    setFormMode("edit");
    setSelectedTeachingSchedule(teachingSchedule);
    setOpenForm(true);
  };

  const handleOpenDeleteConfirm = (teachingSchedule: ITeachingScheduleResponse) => {
    setDeletingTeachingSchedule(teachingSchedule);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingTeachingSchedule?.id) {
      showSnackbar("Không tìm thấy lịch dạy để xoá", "error");
      setOpenDeleteConfirm(false);
      return;
    }

    deleteTeachingScheduleMutation.mutate(deletingTeachingSchedule.id, {
      onSuccess: (response) => {
        const isSetInactive = response?.message
          ?.toLowerCase()
          .includes("set to inactive");
        const isDeleted = response?.message
          ?.toLowerCase()
          .includes("deleted successfully");

        if (isSetInactive) {
          showSnackbar(
            "Đã chuyển lịch dạy sang inactive. Bấm xoá lần nữa để xoá hẳn.",
            "success"
          );
        } else if (isDeleted) {
          showSnackbar("Đã xoá vĩnh viễn lịch dạy", "success");
        } else {
          showSnackbar(response?.message ?? "Xoá lịch dạy thành công", "success");
        }

        setOpenDeleteConfirm(false);
        setDeletingTeachingSchedule(undefined);
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail ?? "Xoá lịch dạy thất bại";
        showSnackbar(detail, "error");
      },
    });
  };

  if (isTableView && isLoading) {
    return (
      <main className="admin-main-container">
        <Loading />
      </main>
    );
  }

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="students-breadcrumb"
        items={[
          { label: "Dashboard", to: dashBoardUrl },
          { label: "Teaching Schedules" },
        ]}
      />

      <Box className="admin-main-box">
        <StatusFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} />

        <SearchEngine
          placeholder="Tìm theo lớp, giảng viên, môn học, email, phòng..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Button
            onClick={handleOpenAddForm}
            className="btn-spacing-left"
        >
            Add Schedule
        </Button>
        <Button
            className="btn-spacing-left"
            onClick={() =>
              setScheduleView((prev) => (prev === "room" ? "table" : "room"))
            }
        >
            {scheduleView === "room" ? "Table UI" : "Room UI"}
        </Button>
        <Button
            className="btn-spacing-left"
            onClick={() =>
              setScheduleView((prev) => (prev === "teacher" ? "table" : "teacher"))
            }
        >
            {scheduleView === "teacher" ? "Table UI" : "Teacher UI"}
        </Button>
        <Button
            className="btn-spacing-left"
            onClick={() =>
              setScheduleView((prev) => (prev === "class" ? "table" : "class"))
            }
        >
            {scheduleView === "class" ? "Table UI" : "Class UI"}
        </Button>
      </Box>

      {scheduleView === "room" ? (
        <TeachingScheduleByRoom />
      ) : scheduleView === "teacher" ? (
        <TeachingScheduleByTeacher />
      ) : scheduleView === "class" ? (
        <TeachingScheduleByClass />
      ) : (
        <>
          <TeachingSchedulesTable
            teachingSchedules={teachingSchedules}
            onEdit={handleOpenEditForm}
            onDelete={handleOpenDeleteConfirm}
          />

          <PaginationUniCore
            totalItems={teachingSchedules?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(value) => setPage(value)}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(1);
            }}
          />
        </>
      )}

      <TeachingSchedulesFormModel
        open={openForm}
        mode={formMode}
        initialValues={selectedTeachingSchedule}
        onClose={() => {
          setOpenForm(false);
          setSelectedTeachingSchedule(undefined);
        }}
      />

      <ConfirmDialog
        open={openDeleteConfirm}
        title="Xác nhận xoá"
        message={
          deletingTeachingSchedule?.status?.toLowerCase() === "inactive"
            ? "Lịch dạy đang inactive. Nếu tiếp tục, dữ liệu sẽ bị xoá vĩnh viễn."
            : "Lần xoá đầu sẽ chuyển lịch dạy sang inactive. Bấm xoá lần nữa để xoá hẳn."
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setOpenDeleteConfirm(false);
          setDeletingTeachingSchedule(undefined);
        }}
      />
    </main>
  );
}

export default TeachingSchedules;
