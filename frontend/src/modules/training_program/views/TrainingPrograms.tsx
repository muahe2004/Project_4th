
import { useRef, useState, type ChangeEvent } from "react";
import { Box } from "@mui/material";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import { STATUS_OPTIONS } from "../../../constants/status";
import { dashBoardUrl } from "../../../routes/urls";
import { useGetTrainingPrograms } from "../apis/getTrainingPrograms";
import { useImportTrainingProgram } from "../apis/importTrainingProgram";
import { useUploadTrainingProgram } from "../apis/uploadTrainingProgram";
import ImportFormModel from "../components/ImportFormModel";
import TrainingProgramTable from "../components/TrainingProgramTable";
import type {
  ITrainingProgramImportPayload,
  ITrainingProgramUploadResponse,
} from "../types";

export function TrainingPrograms() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [openImport, setOpenImport] = useState(false);
  const [importData, setImportData] = useState<ITrainingProgramUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = useUploadTrainingProgram();
  const importMutation = useImportTrainingProgram();

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
  };

  const { data: trainingPrograms, isLoading } = useGetTrainingPrograms(params);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const response = await uploadMutation.mutateAsync(file);
      setImportData(response);
      setOpenImport(true);
    } finally {
      event.target.value = "";
    }
  };

  const handleImportTrainingProgram = async (
    subjects: { subject_code?: string | null; subject_name?: string | null; term?: number | null }[]
  ) => {
    if (!importData) {
      return;
    }

    const payload: ITrainingProgramImportPayload = {
      program_type: importData.training_program.program_type || "",
      training_program_name: importData.training_program.training_program_name || null,
      academic_year: importData.training_program.academic_year || "",
      specialization_code: importData.training_program.specialization_code || "",
      specialization_name: importData.training_program.specialization_name || null,
      status: "active",
      subjects: subjects
        .filter((subject): subject is { subject_code: string; subject_name: string; term: number } =>
          Boolean(subject.subject_code && subject.subject_name && subject.term)
        )
        .map((subject) => ({
          subject_code: subject.subject_code,
          subject_name: subject.subject_name,
          term: subject.term,
        })),
    };

    await importMutation.mutateAsync(payload);
    setOpenImport(false);
    setImportData(null);
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
          { label: "Dashboard", to: dashBoardUrl },
          { label: "Training Programs" },
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
          placeholder="Tìm theo tên CTĐT, niên khoá, loại CTĐT..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Button onClick={handleImportClick} className="btn-spacing-left">
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          hidden
          onChange={(event) => void handleFileChange(event)}
        />
      </Box>

      <TrainingProgramTable trainingPrograms={trainingPrograms} />

      <PaginationUniCore
        totalItems={trainingPrograms?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(currentPage) => setPage(currentPage)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
      />

      <ImportFormModel
        open={openImport}
        onClose={() => setOpenImport(false)}
        data={importData}
        onImport={handleImportTrainingProgram}
        isImporting={importMutation.isPending}
      />
    </main>
  );
}

export default TrainingPrograms;
