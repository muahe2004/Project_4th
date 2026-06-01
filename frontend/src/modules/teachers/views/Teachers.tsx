import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import { getStatusOptions } from "../../../utils/status/status-i18n";
import { dashBoardUrl } from "../../../routes/urls";
import { useDeleteTeacher } from "../apis/deleteTeacher";
import { useExportExampleFile } from "../apis/exportExampleFile";
import { useGetTeachers } from "../apis/getTeachers";
import { useImportTeacher } from "../apis/importTeacher";
import { useUploadTeacher } from "../apis/uploadTeacher";
import ImportFormModel from "../components/ImportFormModel";
import TeacherFormModel from "../components/TeacherFormModel";
import TeacherTable from "../components/TeachetTable";
import type { ITeacherResponse, ITeacherUploadResponse } from "../types";

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
  const [importPreview, setImportPreview] = useState<ITeacherUploadResponse | null>(null);
  const [openImportFormModel, setOpenImportFormModel] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<ITeacherResponse | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const { showSnackbar } = useSnackbar();
  const deleteTeacherMutation = useDeleteTeacher({});
  const { mutateAsync: exportExampleFile, isPending: isExportingExampleFile } = useExportExampleFile({});
  const { mutateAsync: importTeacher, isPending: isImportingTeachers } = useImportTeacher({});
  const { mutateAsync: uploadTeacherFile, isPending: isUploadingTeacherFile } = useUploadTeacher({});

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

  const handleOpenImportFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImportTeacherFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      const uploadedResult = await uploadTeacherFile(selectedFile);
      setImportPreview(uploadedResult);
      setOpenImportFormModel(true);
    } catch (error) {
      console.error("Upload teacher file failed:", error);
      setImportPreview(null);
      setOpenImportFormModel(false);
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteTeacher = (teacher?: ITeacherResponse) => {
    if (!teacher?.id) {
      showSnackbar(t("teachers.messages.notFoundToDelete"), "error");
      return;
    }

    setTeacherToDelete(teacher);
  };

  const confirmDeleteTeacher = () => {
    if (!teacherToDelete?.id) {
      setTeacherToDelete(undefined);
      showSnackbar(t("teachers.messages.notFoundToDelete"), "error");
      return;
    }

    deleteTeacherMutation.mutate([teacherToDelete.id], {
      onSuccess: (responses) => {
        const message = responses?.[0]?.message ?? t("teachers.messages.deleteSuccess");
        showSnackbar(message, "success");
        setTeacherToDelete(undefined);
        void refetch();
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail ?? t("teachers.messages.deleteFailed");
        showSnackbar(detail, "error");
        setTeacherToDelete(undefined);
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
          { label: t("common.dashboard"), to: dashBoardUrl },
          { label: t("teachers.title") },
        ]}
      />

      <Box className="admin-main-box">
        <StatusFilter
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={getStatusOptions()}
        />

        <SearchEngine
          placeholder={t("teachers.searchPlaceholder")}
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
          {t("teachers.actions.add")}
        </Button>

        <Button
          onClick={() => {
            void exportExampleFile();
          }}
          disabled={isExportingExampleFile}
          className="btn-spacing-left"
        >
          {isExportingExampleFile ? t("teachers.actions.exporting") : t("teachers.actions.exportSample")}
        </Button>

        <Button
          onClick={handleOpenImportFilePicker}
          disabled={isUploadingTeacherFile}
          className="btn-spacing-left"
        >
          {isUploadingTeacherFile ? t("teachers.actions.importing") : t("teachers.actions.import")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={handleImportTeacherFile}
        />
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

      <ConfirmDialog
        open={Boolean(teacherToDelete)}
        title={t("common.confirmDeleteTitle", "Confirm Delete")}
        message={t("teachers.confirmDelete")}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        onConfirm={confirmDeleteTeacher}
        onCancel={() => setTeacherToDelete(undefined)}
      />

      <ImportFormModel
        open={openImportFormModel}
        onClose={() => setOpenImportFormModel(false)}
        data={importPreview}
        isImporting={isImportingTeachers}
        onImport={async (teachersPayload) => {
          try {
            await importTeacher(teachersPayload);
            showSnackbar(t("teachers.messages.importSuccess"), "success");
            setOpenImportFormModel(false);
            setImportPreview(null);
          } catch (error: any) {
            const detail = error?.response?.data?.detail ?? error?.data?.detail ?? t("teachers.messages.importFailed");
            showSnackbar(detail, "error");
          }
        }}
      />
    </main>
  );
}

export default Teachers;
