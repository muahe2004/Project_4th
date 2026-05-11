import {
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
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  ITrainingProgramUploadResponse,
  ITrainingProgramFileSubjectData,
  ITrainingProgramFileInvalidSubject,
} from "../types";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import ImportFormModelDialog from "./ImportFormModelDialog";

interface ImportFormModelProps {
  open: boolean;
  onClose: () => void;
  data: ITrainingProgramUploadResponse | null;
  onImport: (subjects: ITrainingProgramFileSubjectData[]) => Promise<void>;
  isImporting?: boolean;
}

type RowSource = "valid" | "invalid";

type ImportPreviewRow = ITrainingProgramFileSubjectData & {
  source: RowSource;
  row?: number;
  errors?: string[];
  index: number;
};

const ImportFormModel = ({
  open,
  onClose,
  data,
  onImport,
  isImporting = false,
}: ImportFormModelProps) => {
  const { t } = useTranslation();
  const [openConfirmClose, setOpenConfirmClose] = useState(false);
  const [validSubjects, setValidSubjects] = useState<ITrainingProgramFileSubjectData[]>([]);
  const [invalidSubjects, setInvalidSubjects] = useState<ITrainingProgramFileInvalidSubject[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<RowSource>("valid");
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingSubject, setEditingSubject] = useState<ITrainingProgramFileSubjectData | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setValidSubjects(data?.training_program.subjects ?? []);
    setInvalidSubjects(data?.invalid_subjects ?? []);
  }, [open, data]);

  const rows: ImportPreviewRow[] = useMemo(() => {
    const validRows = validSubjects.map((subject, index) => ({
      ...subject,
      source: "valid" as const,
      index,
    }));
    const invalidRows = invalidSubjects.map((subject, index) => ({
      ...subject,
      source: "invalid" as const,
      index,
      errors: subject.errors,
      row: subject.row,
    }));
    return [...validRows, ...invalidRows];
  }, [validSubjects, invalidSubjects]);

  const handleImport = async () => {
    if (invalidSubjects.length > 0) {
      return;
    }
    await onImport(validSubjects);
  };

  const openEdit = (row: ImportPreviewRow) => {
    setEditingSource(row.source);
    setEditingIndex(row.index);
    setEditingSubject({
      subject_code: row.subject_code ?? null,
      subject_name: row.subject_name ?? null,
      term: row.term ?? null,
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = (subject: ITrainingProgramFileSubjectData) => {
    if (editingIndex < 0) {
      setOpenEditDialog(false);
      return;
    }

    if (editingSource === "valid") {
      setValidSubjects((prev) =>
        prev.map((item, index) => (index === editingIndex ? subject : item))
      );
    } else {
      setInvalidSubjects((prev) => prev.filter((_, index) => index !== editingIndex));
      setValidSubjects((prev) => [...prev, subject]);
    }

    setOpenEditDialog(false);
    setEditingSubject(null);
    setEditingIndex(-1);
  };

  return (
    <Dialog open={open} onClose={() => setOpenConfirmClose(true)} fullWidth maxWidth="xl">
      <DialogTitle className="primary-dialog-title">{t("trainingProgram.import.title")}</DialogTitle>
      <DialogContent dividers>
        {!data ? (
          <Typography>{t("trainingProgram.import.noData")}</Typography>
        ) : (
          <>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              {t("trainingProgram.import.fileName")}: {data.file_information.file_name}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              {t("trainingProgram.import.program")}: {data.training_program.training_program_name || ""} | {t("trainingProgram.import.academicYear")}: {data.training_program.academic_year || ""}
            </Typography>
            {invalidSubjects.length > 0 && (
              <Typography sx={{ color: "#d32f2f", fontWeight: 600, mb: 2 }}>
                {t("trainingProgram.import.invalidRows", { count: invalidSubjects.length })}
              </Typography>
            )}
            <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader className="sticky-table" aria-label="import preview training programs table">
                <TableHead className="primary-thead">
                  <TableRow className="primary-trow">
                    <TableCell className="primary-thead__cell" align="center">{t("trainingProgram.import.table.subjectCode")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("trainingProgram.import.table.subjectName")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("trainingProgram.import.table.term")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("trainingProgram.import.table.errorReason")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("common.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={`${row.subject_code || "subject"}-${row.source}-${index}`} className="sticky-trow">
                      <TableCell className="sticky-tcell" align="center">{row.subject_code || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{row.subject_name || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{row.term || ""}</TableCell>
                      <TableCell
                        className="sticky-tcell"
                        align="left"
                        sx={row.source === "invalid" ? { color: "#d32f2f", fontWeight: 600 } : undefined}
                      >
                        {row.source === "invalid" ? row.errors?.join(", ") || "" : ""}
                      </TableCell>
                      <TableCell className="sticky-tcell" align="center">
                        <IconButton className="primary-tcell__button--icon" onClick={() => openEdit(row)}>
                          <EditSquareIcon />
                        </IconButton>
                        <IconButton
                          className="primary-tcell__button--icon primary-tcell__button--delete"
                          onClick={() => {
                            if (row.source === "valid") {
                              setValidSubjects((prev) => prev.filter((_, i) => i !== row.index));
                            } else {
                              setInvalidSubjects((prev) => prev.filter((_, i) => i !== row.index));
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenConfirmClose(true)} className="button-cancel">{t("common.cancel")}</Button>
        <Button onClick={handleImport} disabled={isImporting || invalidSubjects.length > 0}>
          {isImporting ? t("trainingProgram.actions.importing") : t("trainingProgram.actions.import")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirmClose}
        title={t("common.confirmExitTitle")}
        message={t("trainingProgram.import.confirmExit")}
        onCancel={() => setOpenConfirmClose(false)}
        onConfirm={() => {
          setOpenConfirmClose(false);
          onClose();
        }}
      />

      <ImportFormModelDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        initialSubject={editingSubject}
        onSave={handleSaveEdit}
      />
    </Dialog>
  );
};

export default ImportFormModel;
