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
import { useDeleteSubject } from "../apis/deleteSubject";
import { useGetSubjects } from "../apis/getSubjects";
import SubjectFormModel from "../components/SubjectFormModel";
import SubjectsTable from "../components/SubjectsTable";
import type { ISubject } from "../types";
import { useTranslation } from "react-i18next";

import "./styles/Subjects.css";

export function Subjects() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedSubject, setSelectedSubject] = useState<ISubject | undefined>(
    undefined
  );

  const { showSnackbar } = useSnackbar();
  const deleteSubjectMutation = useDeleteSubject({});

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
  };

  const {
    data: subjects,
    isLoading,
    refetch,
  } = useGetSubjects(params);

  const handleDeleteSubject = (subject?: ISubject) => {
    if (!subject?.id) {
      showSnackbar(t("subjects.messages.missingId"), "error");
      return;
    }

    if (!window.confirm(t("subjects.confirmDelete"))) {
      return;
    }

    deleteSubjectMutation.mutate([subject.id], {
      onSuccess: (responses) => {
        const message = responses?.[0]?.message ?? t("subjects.messages.deleteSuccess");
        showSnackbar(message, "success");
        void refetch();
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail ?? t("subjects.messages.deleteFailed");
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
        className="subjects-breadcrumb"
        items={[
          { label: t("subjects.breadcrumb.dashboard"), to: dashBoardUrl },
          { label: t("subjects.breadcrumb.title") },
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
          placeholder={t("subjects.searchPlaceholder")}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Button
          onClick={() => {
            setMode("add");
            setSelectedSubject(undefined);
            setOpen(true);
          }}
          className="btn-spacing-left"
        >
          {t("subjects.addSubject")}
        </Button>
      </Box>

      <SubjectsTable
        subjects={subjects}
        onEdit={(subject) => {
          setMode("edit");
          setSelectedSubject(subject);
          setOpen(true);
        }}
        onDelete={handleDeleteSubject}
      />

      <PaginationUniCore
        totalItems={subjects?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(currentPage) => setPage(currentPage)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
      />

      <SubjectFormModel
        open={open}
        mode={mode}
        initialValues={selectedSubject}
        onClose={() => setOpen(false)}
      />
    </main>
  );
}

export default Subjects;
