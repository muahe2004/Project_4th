import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

import ManagementScoreTable from "../components/ManagementScoreTable";
import { useGetStudentGPA } from "../apis/getStudentGPA";

export function AdvisorClassScore() {
  const location = useLocation();
  const state = location.state as
    | {
        classId?: string;
        classCode?: string;
        className?: string;
      }
    | undefined;

  const classId = state?.classId;
  const { data, isLoading, isError, error } = useGetStudentGPA(
    classId ? { class_id: classId } : {}
  );

  return (
    <main className="admin-main-container">
      <Box className="admin-main-box" sx={{ mb: 2 }}>
        <Typography className="primary-title" sx={{ mb: 0, width: "100%", textAlign: "center" }}>
          Bảng điểm lớp: {state?.className ?? "-"} ({state?.classCode ?? "-"})
        </Typography>
      </Box>

      {!classId ? (
        <Alert severity="warning">Thiếu thông tin lớp để tải danh sách sinh viên.</Alert>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {(error as any)?.response?.data?.detail ?? "Lấy danh sách sinh viên theo lớp thất bại"}
        </Alert>
      ) : (
        <ManagementScoreTable rows={data?.data} />
      )}
    </main>
  );
}

export default AdvisorClassScore;
