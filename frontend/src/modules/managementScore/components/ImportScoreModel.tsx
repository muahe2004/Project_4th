import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import type { IScoreUploadInvalidRow, IScoreUploadResponse, IScoreUploadRow } from "../types";
import ImportScoreModelDialog from "./ImportScoreModelDialog";

interface ImportScoreModelProps {
  open: boolean;
  onClose: () => void;
  data: IScoreUploadResponse | null;
  onImport: (scores: IScoreUploadRow[]) => Promise<void>;
  isImporting?: boolean;
  errorMessage?: string | null;
}

type RowSource = "valid" | "invalid";

type ImportPreviewRow = IScoreUploadRow & {
  source: RowSource;
  row?: number;
  errors?: string[];
  index: number;
};

const formatScore = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }
  return value.toFixed(2);
};

const ImportScoreModel = ({ open, onClose, data, onImport, isImporting = false, errorMessage }: ImportScoreModelProps) => {
  const [openConfirmClose, setOpenConfirmClose] = useState(false);
  const [validScores, setValidScores] = useState<IScoreUploadRow[]>([]);
  const [invalidScores, setInvalidScores] = useState<IScoreUploadInvalidRow[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<RowSource>("valid");
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingScore, setEditingScore] = useState<IScoreUploadRow | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setValidScores(data?.scores ?? []);
    setInvalidScores(data?.invalid_scores ?? []);
  }, [open, data]);

  const rows: ImportPreviewRow[] = useMemo(() => {
    const validRows = validScores.map((score, index) => ({
      ...score,
      source: "valid" as const,
      index,
    }));
    const invalidRows = invalidScores.map((score, index) => ({
      ...score,
      source: "invalid" as const,
      index,
      errors: score.errors,
      row: score.row,
    }));
    return [...validRows, ...invalidRows];
  }, [validScores, invalidScores]);

  const hasInvalidRows = invalidScores.length > 0;

  const openEdit = (row: ImportPreviewRow) => {
    setEditingSource(row.source);
    setEditingIndex(row.index);
    setEditingScore({
      row: row.row ?? 0,
      class_code: row.class_code ?? null,
      student_code: row.student_code ?? null,
      student_name: row.student_name ?? null,
      family_name: row.family_name ?? null,
      given_name: row.given_name ?? null,
      d1: row.d1 ?? null,
      d2: row.d2 ?? null,
      thi: row.thi ?? null,
      tbm: row.tbm ?? null,
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = (score: IScoreUploadRow) => {
    if (editingIndex < 0) {
      setOpenEditDialog(false);
      return;
    }

    if (editingSource === "valid") {
      setValidScores((prev) => prev.map((item, index) => (index === editingIndex ? score : item)));
    } else {
      setInvalidScores((prev) => prev.filter((_, index) => index !== editingIndex));
      setValidScores((prev) => [...prev, score]);
    }

    setOpenEditDialog(false);
    setEditingScore(null);
    setEditingIndex(-1);
  };

  const handleImport = async () => {
    if (hasInvalidRows) {
      return;
    }
    await onImport(validScores);
  };

  return (
    <Dialog open={open} onClose={() => setOpenConfirmClose(true)} fullWidth maxWidth="xl">
      <DialogTitle className="primary-dialog-title">Import Score Preview</DialogTitle>
      <DialogContent dividers>
        {errorMessage ? (
          <Typography sx={{ color: "#d32f2f", fontWeight: 700 }}>{errorMessage}</Typography>
        ) : isImporting && !data ? (
          <Typography>Đang đọc file điểm...</Typography>
        ) : !data ? (
          <Typography>Không có dữ liệu import.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Typography sx={{ fontWeight: 700 }}>File name: {data.file_information.file_name}</Typography>
              <Typography sx={{ color: "#374151" }}>
                Lớp: {data.file_information.class_code || "-"}
              </Typography>
              <Typography sx={{ color: "#374151" }}>
                Học phần: {data.file_information.subject_name || "-"} ({data.file_information.subject_code || "-"})
              </Typography>
              <Typography sx={{ color: "#374151" }}>
                Năm học: {data.file_information.academic_year || "-"}
              </Typography>
              {hasInvalidRows && (
                <Typography sx={{ color: "#d32f2f", fontWeight: 700 }}>
                  Còn {invalidScores.length} dòng lỗi, vui lòng sửa trước khi import.
                </Typography>
              )}
            </Box>

            <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader className="sticky-table" aria-label="import preview score table">
                <TableHead className="primary-thead">
                  <TableRow className="primary-trow">
                    <TableCell className="primary-thead__cell" align="center">Mã lớp</TableCell>
                    <TableCell className="primary-thead__cell" align="center">MSV</TableCell>
                    <TableCell className="primary-thead__cell" align="left">Họ và đệm</TableCell>
                    <TableCell className="primary-thead__cell" align="left">Tên</TableCell>
                    <TableCell className="primary-thead__cell" align="center">D1</TableCell>
                    <TableCell className="primary-thead__cell" align="center">D2</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Thi</TableCell>
                    <TableCell className="primary-thead__cell" align="center">TBM</TableCell>
                    <TableCell className="primary-thead__cell" align="left">Lý do lỗi</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((score, index) => (
                    <TableRow key={`${score.student_code || "score"}-${score.source}-${index}`} className="sticky-trow">
                      <TableCell className="sticky-tcell" align="center">{score.class_code || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{score.student_code || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{score.family_name || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{score.given_name || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{formatScore(score.d1)}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{formatScore(score.d2)}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{formatScore(score.thi)}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{formatScore(score.tbm)}</TableCell>
                      <TableCell
                        className="sticky-tcell"
                        align="left"
                        sx={score.source === "invalid" ? { color: "#d32f2f", fontWeight: 600 } : undefined}
                      >
                        {score.source === "invalid" ? score.errors?.join(", ") || "" : ""}
                      </TableCell>
                      <TableCell className="sticky-tcell" align="center">
                        <IconButton className="primary-tcell__button--icon" onClick={() => openEdit(score)}>
                          <EditSquareIcon />
                        </IconButton>
                        <IconButton
                          className="primary-tcell__button--icon primary-tcell__button--delete"
                          onClick={() => {
                            if (score.source === "valid") {
                              setValidScores((prev) => prev.filter((_, itemIndex) => itemIndex !== score.index));
                            } else {
                              setInvalidScores((prev) => prev.filter((_, itemIndex) => itemIndex !== score.index));
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenConfirmClose(true)} className="button-cancel">Huỷ</Button>
        <Button onClick={handleImport} disabled={isImporting || hasInvalidRows || !data}>
          {isImporting ? "Importing..." : "Import"}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirmClose}
        title="Xác nhận thoát"
        message="Bạn có chắc muốn thoát form import?"
        onCancel={() => setOpenConfirmClose(false)}
        onConfirm={() => {
          setOpenConfirmClose(false);
          onClose();
        }}
      />

      <ImportScoreModelDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setEditingScore(null);
          setEditingIndex(-1);
        }}
        initialScore={editingScore}
        onSave={handleSaveEdit}
      />
    </Dialog>
  );
};

export default ImportScoreModel;
