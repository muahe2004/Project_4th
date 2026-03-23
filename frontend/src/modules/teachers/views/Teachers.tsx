import { useState } from "react";
import { Box } from "@mui/material";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import { STATUS_OPTIONS } from "../../../constants/status";
import { dashBoardUrl } from "../../../routes/urls";
import { useDeleteTeacher } from "../apis/deleteTeacher";
import { useGetTeachers } from "../apis/getTeachers";
import TeacherFormModel from "../components/TeacherFormModel";
import TeacherTable from "../components/TeachetTable";
import type { ITeacherResponse } from "../types";

export function Teachers() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedTeacher, setSelectedTeacher] = useState<ITeacherResponse | undefined>(
    undefined
  );

  const { showSnackbar } = useSnackbar();
  const deleteTeacherMutation = useDeleteTeacher({});

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
  };

  const {
    data: teachers,
    isLoading,
    refetch,
  } = useGetTeachers(params);

  const handleDeleteTeacher = (teacher?: ITeacherResponse) => {
    if (!teacher?.id) {
      showSnackbar("Không tìm thấy mã giảng viên để xoá", "error");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xoá giảng viên này không?")) {
      return;
    }

    deleteTeacherMutation.mutate([teacher.id], {
      onSuccess: (responses) => {
        const message = responses?.[0]?.message ?? "Xoá giảng viên thành công";
        showSnackbar(message, "success");
        void refetch();
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail ?? "Xoá giảng viên thất bại";
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

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="teachers-breadcrumb"
        items={[
          { label: "Dashboard", to: dashBoardUrl },
          { label: "Teachers" },
        ]}
      />

      <Box className="admin-main-box">
        <StatusFilter
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />

        <SearchEngine
          placeholder="Tìm theo tên giảng viên, mã giảng viên..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Button
          onClick={() => {
            setMode("add");
            setSelectedTeacher(undefined);
            setOpen(true);
          }}
          className="btn-spacing-left"
        >
          Add Teacher
        </Button>
      </Box>

      <TeacherTable
        teachers={teachers}
        onEdit={(teacher) => {
          setMode("edit");
          setSelectedTeacher(teacher);
          setOpen(true);
        }}
        onDelete={handleDeleteTeacher}
      />

      <PaginationUniCore
        totalItems={teachers?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(currentPage) => setPage(currentPage)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
      />

      <TeacherFormModel
        open={open}
        mode={mode}
        initialValues={selectedTeacher}
        onClose={() => setOpen(false)}
      />
    </main>
  );
}

export default Teachers;
