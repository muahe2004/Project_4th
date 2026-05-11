import { useRef, useState, type ChangeEvent } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { dashBoardUrl } from "../../../routes/urls";
import { useGetStudentGPA } from "../apis/getStudentGPA";
import ManagementScoreTable from "../components/ManagementScoreTable";
import ImportScoreModel from "../components/ImportScoreModel";
import { useUploadScore } from "../apis/uploadScore";
import type { IScoreUploadResponse, IScoreUploadRow } from "../types";
import Button from "../../../components/Button/Button";

import "./styles/ManagementScore.css";

const DEFAULT_ROWS_PER_PAGE = 10;

export function ManagementScore() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [search, setSearch] = useState("");
  const [openImportScoreModel, setOpenImportScoreModel] = useState(false);
  const [importPreview, setImportPreview] = useState<IScoreUploadResponse | null>(null);
  const [importScoreError, setImportScoreError] = useState<string | null>(null);
  const [isUploadingScorePreview, setIsUploadingScorePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const params = {
    skip: (page - 1) * rowsPerPage,
    limit: rowsPerPage,
    ...(search && { search }),
  };

  const { data, isLoading, isError, error } = useGetStudentGPA(params);
  const { mutateAsync: uploadScoreFile, isPending: isUploadingScoreFile } = useUploadScore({});

  const handleOpenImportFilePicker = () => {
    setOpenImportScoreModel(true);
    setImportPreview(null);
    setImportScoreError(null);
    setIsUploadingScorePreview(false);
    fileInputRef.current?.click();
  };

  const handleImportScoreFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setOpenImportScoreModel(true);
    setIsUploadingScorePreview(true);

    try {
      const uploadedResult = await uploadScoreFile(selectedFile);
      setImportPreview(uploadedResult);
    } catch (uploadError) {
      console.error("Upload score file failed:", uploadError);
      setImportScoreError((uploadError as any)?.response?.data?.detail ?? t("managementScore.actions.uploadFailed"));
    } finally {
      setIsUploadingScorePreview(false);
      event.target.value = "";
    }
  };

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="management-score-breadcrumb"
        items={[
          { label: t("common.dashboard"), to: dashBoardUrl },
          { label: t("managementScore.title") },
        ]}
      />

      <Box className="admin-main-box">
        <SearchEngine
          placeholder={t("managementScore.searchPlaceholder")}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Button
          onClick={handleOpenImportFilePicker}
          disabled={isUploadingScoreFile}
          className="management-score__import-button"
        >
          {isUploadingScoreFile ? t("managementScore.actions.uploading") : t("managementScore.actions.import")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={handleImportScoreFile}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {(error as any)?.response?.data?.detail ?? t("managementScore.errors.loadData")}
        </Alert>
      ) : (
        <>
          <ManagementScoreTable rows={data?.data} />
          <Box className="management-score__pagination">
            <PaginationUniCore
              totalItems={data?.total || 0}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(currentPage) => setPage(currentPage)}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setPage(1);
              }}
            />
          </Box>
        </>
      )}

      <ImportScoreModel
        open={openImportScoreModel}
        onClose={() => {
          setOpenImportScoreModel(false);
          setImportPreview(null);
          setImportScoreError(null);
          setIsUploadingScorePreview(false);
        }}
        data={importPreview}
        isImporting={isUploadingScorePreview}
        errorMessage={importScoreError}
        onImport={async (scoresPayload: IScoreUploadRow[]) => {
          setOpenImportScoreModel(false);
          setImportPreview(null);
          setImportScoreError(null);
        }}
      />
    </main>
  );
}

export default ManagementScore;
