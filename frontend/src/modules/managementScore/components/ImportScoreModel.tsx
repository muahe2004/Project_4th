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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      <DialogTitle className="primary-dialog-title">{t("managementScore.import.title")}</DialogTitle>
      <DialogContent dividers>
        {errorMessage ? (
          <Typography sx={{ color: "#d32f2f", fontWeight: 700 }}>{errorMessage}</Typography>
        ) : isImporting && !data ? (
          <Typography>{t("managementScore.import.loading")}</Typography>
        ) : !data ? (
          <Typography>{t("managementScore.import.noData")}</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Typography sx={{ fontWeight: 700 }}>{t("managementScore.import.fileName")}: {data.file_information.file_name}</Typography>
              <Typography sx={{ color: "#374151" }}>
                {t("managementScore.import.class")}: {data.file_information.class_code || "-"}
              </Typography>
              <Typography sx={{ color: "#374151" }}>
                {t("managementScore.import.subject")}: {data.file_information.subject_name || "-"} ({data.file_information.subject_code || "-"})
              </Typography>
              <Typography sx={{ color: "#374151" }}>
                {t("managementScore.import.academicYear")}: {data.file_information.academic_year || "-"}
              </Typography>
              {hasInvalidRows && (
                <Typography sx={{ color: "#d32f2f", fontWeight: 700 }}>
                  {t("managementScore.import.invalidRows", { count: invalidScores.length })}
                </Typography>
              )}
            </Box>

            <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader className="sticky-table" aria-label="import preview score table">
                <TableHead className="primary-thead">
                  <TableRow className="primary-trow">
                    <TableCell className="primary-thead__cell" align="center">{t("managementScore.import.table.classCode")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("managementScore.import.table.studentCode")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("managementScore.import.table.familyName")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("managementScore.import.table.givenName")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("managementScore.import.table.d1")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("managementScore.import.table.d2")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("managementScore.import.table.thi")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("managementScore.import.table.tbm")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("managementScore.import.table.errorReason")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("common.actions")}</TableCell>
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
        <Button onClick={() => setOpenConfirmClose(true)} className="button-cancel">{t("common.cancel")}</Button>
        <Button onClick={handleImport} disabled={isImporting || hasInvalidRows || !data}>
          {isImporting ? t("managementScore.actions.importing") : t("managementScore.actions.import")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirmClose}
        title={t("common.confirmExitTitle")}
        message={t("managementScore.import.confirmExit")}
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
