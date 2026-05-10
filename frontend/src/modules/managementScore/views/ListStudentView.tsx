import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useGetScoreByClassSubject } from "../apis/getScoreByClassSubject";
import ListStudentScoreTable from "../components/ListStudentScoreTable";
import Button from "../../../components/Button/Button";
import ImportScoreModel from "../components/ImportScoreModel";
import { useUploadScore } from "../apis/uploadScore";
import { useImportScoreList } from "../apis/importScoreList";
import type {
  IScoreByClassSubjectResponse,
  IScoreUploadResponse,
  IScoreUploadRow,
} from "../types";

function ListStudentScoreSubjectContent({
  data,
  isLoading,
  isError,
  error,
}: {
  data?: IScoreByClassSubjectResponse;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}) {
  return (
    <>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {(error as any)?.response?.data?.detail ?? "Lấy danh sách điểm theo lớp/môn thất bại"}
        </Alert>
      ) : (
        <ListStudentScoreTable rows={data?.students} />
      )}
    </>
  );
}

export function ListStudentScoreSubject() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openImportScoreModel, setOpenImportScoreModel] = useState(false);
  const [importPreview, setImportPreview] = useState<IScoreUploadResponse | null>(null);
  const [importScoreError, setImportScoreError] = useState<string | null>(null);
  const [isUploadingScorePreview, setIsUploadingScorePreview] = useState(false);
  const state = location.state as
      | {
        classId?: string;
        subjectId?: string;
        academicTermId?: string;
        classCode?: string;
        className?: string;
        subjectCode?: string;
        subjectName?: string;
      }
    | undefined;

  const classId = state?.classId;
  const subjectId = state?.subjectId;
  const academicTermId = state?.academicTermId ?? "";
  const scoreQuery = useGetScoreByClassSubject(
    classId && subjectId
      ? {
          class_id: classId,
          subject_id: subjectId,
        }
      : undefined,
    {
      enabled: Boolean(classId && subjectId),
    }
  );

  const handleComponentClick = () => {
    const students = scoreQuery.data?.students ?? [];

    console.log("component payload", {
      academic_term_id: academicTermId,
      subject_id: subjectId ?? "",
      students: students.map((student) => student.student_info),
    });
  };

  const { mutateAsync: uploadScoreFile, isPending: isUploadingScoreFile } = useUploadScore({});
  const { mutateAsync: importScoreList, isPending: isImportingScoreList } = useImportScoreList({});

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingScorePreview(true);

    try {
      const uploadedResult = await uploadScoreFile(file);
      setImportPreview(uploadedResult);
      setOpenImportScoreModel(true);
    } catch (uploadError) {
      console.error("Upload score file failed:", uploadError);
      setImportScoreError((uploadError as any)?.response?.data?.detail ?? "Upload score file failed");
      setOpenImportScoreModel(false);
    } finally {
      setIsUploadingScorePreview(false);
      event.target.value = "";
    }
  };

  return (
    <main className="admin-main-container">
      <Box
        className="admin-main-box"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography className="primary-title" sx={{ mb: 0 }}>
          Lớp: {state?.className ?? "-"} ({state?.classCode ?? "-"}) - Môn: {state?.subjectName ?? "-"} ({state?.subjectCode ?? "-"})
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button onClick={handleImportClick} className="btn-spacing-left" disabled={isUploadingScoreFile}>
            {isUploadingScoreFile ? "Uploading..." : "Import"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            hidden
            onChange={(event) => void handleFileChange(event)}
          />

          <Button onClick={handleImportClick} className="" disabled={isUploadingScoreFile}>
            Khoá điểm
          </Button>

          <Button onClick={handleComponentClick} className="" disabled={!classId || !subjectId || scoreQuery.isLoading}>
            Thành phần
          </Button>

          <Button onClick={handleImportClick} className="" disabled={isUploadingScoreFile}>
            Nhập điểm TP
          </Button>

          <Button onClick={handleImportClick} className="" disabled={isUploadingScoreFile}>
            Nhập điểm Thi
          </Button>

          <Button onClick={handleImportClick} className="" disabled={isUploadingScoreFile}>
            Lưu lại
          </Button>
        </Box>
      </Box>

      {!classId || !subjectId ? (
        <Alert severity="warning">Thiếu classId hoặc subjectId để tải dữ liệu.</Alert>
      ) : (
        <ListStudentScoreSubjectContent {...scoreQuery} />
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
        isImporting={isUploadingScorePreview || isImportingScoreList}
        errorMessage={importScoreError}
        onImport={async (scoresPayload: IScoreUploadRow[]) => {
          const cleanScoresPayload = scoresPayload.map(({ row, ...score }) => score);
          const academicTermId = importPreview?.file_information.academic_term_id;
          const subjectId = importPreview?.file_information.subject_id;
          if (!academicTermId || !subjectId) {
            setImportScoreError("Thiếu academic_term_id hoặc subject_id từ file upload.");
            return;
          }
          const importPayload = {
            academic_term_id: academicTermId,
            subject_id: subjectId,
            class_code: importPreview?.file_information.class_code,
            attempt: importPreview?.file_information.attempt,
            scores: cleanScoresPayload.map((score) => ({
              score_1: score.d1 ?? null,
              score_2: score.d2 ?? null,
              score_exam: score.thi ?? null,
              student_id: score.student_id ?? null,
              student_code: score.student_code ?? null,
              class_code: score.class_code ?? null,
            })),
          };
          try {
            const result = await importScoreList(importPayload as any);
            await scoreQuery.refetch();
            setOpenImportScoreModel(false);
            setImportPreview(null);
            setImportScoreError(null);
          } catch (error) {
            setImportScoreError((error as any)?.response?.data?.detail ?? "Import score list failed");
          }
        }}
      />
    </main>
  );
}

export default ListStudentScoreSubject;
