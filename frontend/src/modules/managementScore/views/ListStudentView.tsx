import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import type { ChangeEvent } from "react";

import { useGetScoreByClassSubject } from "../apis/getScoreByClassSubject";
import ListStudentScoreTable from "../components/ListStudentScoreTable";
import Button from "../../../components/Button/Button";

function ListStudentScoreSubjectContent({
  classId,
  subjectId,
  classCode,
  className,
  subjectCode,
  subjectName,
}: {
  classId: string;
  subjectId: string;
  classCode?: string;
  className?: string;
  subjectCode?: string;
  subjectName?: string;
}) {
  const { data, isLoading, isError, error } = useGetScoreByClassSubject({
    class_id: classId,
    subject_id: subjectId,
  });

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
  const state = location.state as
    | {
        classId?: string;
        subjectId?: string;
        classCode?: string;
        className?: string;
        subjectCode?: string;
        subjectName?: string;
      }
    | undefined;

  const classId = state?.classId;
  const subjectId = state?.subjectId;

  const handleImportClick = () => {
    console.log("import click", { classId, subjectId });
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("selected file", {
      classId,
      subjectId,
      fileName: file?.name,
      file,
    });
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
      </Box>

      {!classId || !subjectId ? (
        <Alert severity="warning">Thiếu classId hoặc subjectId để tải dữ liệu.</Alert>
      ) : (
        <ListStudentScoreSubjectContent
          classId={classId}
          subjectId={subjectId}
          classCode={state?.classCode}
          className={state?.className}
          subjectCode={state?.subjectCode}
          subjectName={state?.subjectName}
        />
      )}
    </main>
  );
}

export default ListStudentScoreSubject;
