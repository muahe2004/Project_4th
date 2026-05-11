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
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";
import type {
  ITeacherFileData,
  ITeacherFileInvalidRow,
  ITeacherUploadResponse,
} from "../types";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import ImportFormModelDialog from "./ImportFormModelDialog";
import { useTranslation } from "react-i18next";

interface ImportFormModelProps {
  open: boolean;
  onClose: () => void;
  data: ITeacherUploadResponse | null;
  onImport: (teachers: ITeacherFileData[]) => Promise<void>;
  isImporting?: boolean;
}

type RowSource = "valid" | "invalid";

type ImportPreviewRow = ITeacherFileData & {
  source: RowSource;
  row?: number;
  errors?: string[];
  index: number;
};

const formatDate = (dateValue?: string | null) => {
  if (!dateValue) {
    return "";
  }
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }
  return parsedDate.toLocaleDateString("vi-VN");
};

const getImportGenderDisplay = (gender?: string | null, t?: (key: string, options?: any) => string) => {
  if (gender === "1") {
    return t ? t("common.male") : "Nam";
  }
  if (gender === "2") {
    return t ? t("common.female") : "Nữ";
  }
  if (gender === "3") {
    return t ? t("common.other") : "Khác";
  }
  return "";
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
  const [validTeachers, setValidTeachers] = useState<ITeacherFileData[]>([]);
  const [invalidTeachers, setInvalidTeachers] = useState<ITeacherFileInvalidRow[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<RowSource>("valid");
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingTeacher, setEditingTeacher] = useState<ITeacherFileData | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setValidTeachers(data?.teachers ?? []);
    setInvalidTeachers(data?.invalid_teachers ?? []);
  }, [open, data]);

  const rows: ImportPreviewRow[] = useMemo(() => {
    const validRows: ImportPreviewRow[] = validTeachers.map((teacher, index) => ({
      ...teacher,
      source: "valid",
      index,
    }));
    const invalidRows: ImportPreviewRow[] = invalidTeachers.map((teacher, index) => ({
      ...teacher,
      source: "invalid",
      index,
      errors: teacher.errors,
      row: teacher.row,
    }));
    return [...validRows, ...invalidRows];
  }, [validTeachers, invalidTeachers]);

  const hasInvalidRows = invalidTeachers.length > 0;

  const handleImport = async () => {
    if (hasInvalidRows) {
      return;
    }
    await onImport(validTeachers);
  };

  const openEdit = (row: ImportPreviewRow) => {
    setEditingSource(row.source);
    setEditingIndex(row.index);
    setEditingTeacher({
      teacher_code: row.teacher_code ?? null,
      name: row.name ?? null,
      gender: row.gender ?? null,
      date_of_birth: row.date_of_birth ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      address: row.address ?? null,
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = (teacher: ITeacherFileData) => {
    if (editingIndex < 0) {
      setOpenEditDialog(false);
      return;
    }

    if (editingSource === "valid") {
      setValidTeachers((prev) =>
        prev.map((item, index) => (index === editingIndex ? teacher : item))
      );
    } else {
      setInvalidTeachers((prev) => prev.filter((_, index) => index !== editingIndex));
      setValidTeachers((prev) => [...prev, teacher]);
    }

    setOpenEditDialog(false);
    setEditingTeacher(null);
    setEditingIndex(-1);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpenConfirmClose(true)}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle className="primary-dialog-title">{t("teachers.import.title")}</DialogTitle>

      <DialogContent dividers>
        {!data ? (
          <Typography>{t("teachers.import.noData")}</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>
              {t("teachers.import.fileName")}: {data.file_information.file_name}
            </Typography>
            {hasInvalidRows && (
              <Typography sx={{ color: "#d32f2f", fontWeight: 600 }}>
                {t("teachers.import.invalidRows", { count: invalidTeachers.length })}
              </Typography>
            )}

            <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader className="sticky-table" aria-label="import preview teachers table">
                <TableHead className="primary-thead">
                  <TableRow className="primary-trow">
                    <TableCell className="primary-thead__cell" align="center">{t("teachers.import.table.teacherCode")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachers.import.table.teacherName")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachers.import.table.gender")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachers.import.table.dateOfBirth")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachers.import.table.email")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachers.import.table.phone")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachers.import.table.placeOfOrigin")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachers.import.table.errorReason")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("common.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((teacher, index) => (
                    <TableRow key={`${teacher.teacher_code || "teacher"}-${teacher.source}-${index}`} className="sticky-trow">
                      <TableCell className="sticky-tcell" align="center">{teacher.teacher_code || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{teacher.name || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{getImportGenderDisplay(teacher.gender, t)}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{formatDate(teacher.date_of_birth)}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{teacher.email || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{teacher.phone || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{teacher.address || ""}</TableCell>
                      <TableCell
                        className="sticky-tcell"
                        align="left"
                        sx={teacher.source === "invalid" ? { color: "#d32f2f", fontWeight: 600 } : undefined}
                      >
                        {teacher.source === "invalid" ? teacher.errors?.join(", ") || "" : ""}
                      </TableCell>
                      <TableCell className="sticky-tcell" align="center">
                        <IconButton
                          className="primary-tcell__button--icon"
                          onClick={() => openEdit(teacher)}
                        >
                          <EditSquareIcon />
                        </IconButton>
                        <IconButton
                          className="primary-tcell__button--icon primary-tcell__button--delete"
                          onClick={() => {
                            if (teacher.source === "valid") {
                              setValidTeachers((prev) => prev.filter((_, i) => i !== teacher.index));
                            } else {
                              setInvalidTeachers((prev) => prev.filter((_, i) => i !== teacher.index));
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
        <Button onClick={handleImport} disabled={isImporting || hasInvalidRows}>
          {isImporting ? t("teachers.actions.importing") : t("teachers.actions.import")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirmClose}
        title={t("common.confirmExitTitle")}
        message={t("teachers.import.confirmExit")}
        onCancel={() => setOpenConfirmClose(false)}
        onConfirm={() => {
          setOpenConfirmClose(false);
          onClose();
        }}
      />

      <ImportFormModelDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        initialTeacher={editingTeacher}
        onSave={handleSaveEdit}
      />
    </Dialog>
  );
};

export default ImportFormModel;
