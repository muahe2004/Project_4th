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
  TextField,
  Typography,
} from "@mui/material";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type {
  IImportTeachingCalenderPayload,
  IUploadTeachingCalenderInvalidRow,
  IUploadTeachingCalenderItem,
  IUploadTeachingCalenderResponse,
} from "../types";
import Button from "../../../components/Button/Button";
import ImportFeedback from "../../../components/Import/ImportFeedback";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import ImportFormModelDialog from "./ImportFormModelDialog";
import { useGetClasses } from "../../classes/apis/getClasses";

interface ImportFormModelProps {
  open: boolean;
  onClose: () => void;
  data: IUploadTeachingCalenderResponse | null;
  onImport: (payload: IImportTeachingCalenderPayload) => Promise<void>;
  isImporting?: boolean;
}

type RowSource = "valid" | "invalid";

type ImportPreviewRow = IUploadTeachingCalenderItem & {
  source: RowSource;
  row?: number;
  errors?: string[];
  index: number;
};

type EditableTeachingSchedule = IUploadTeachingCalenderItem & {
  subject_name?: string | null;
  teacher_name?: string | null;
  room_number?: number | null;
};

const toInputDateValue = (dateValue?: string | null) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsedDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function normalizeDate(dateValue: string): Date {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0);
  }
  return parsed;
}

function weekdayNumber(dateValue: Date): number {
  switch (dateValue.getDay()) {
    case 1:
      return 2;
    case 2:
      return 3;
    case 3:
      return 4;
    case 4:
      return 5;
    case 5:
      return 6;
    case 6:
      return 7;
    default:
      return 8;
  }
}

function parseStudyWeekIndexes(studyWeeks: string): number[] {
  return [...studyWeeks].reduce<number[]>((indexes, char, index) => {
    if (char !== "-") {
      indexes.push(index + 1);
    }
    return indexes;
  }, []);
}

function resolveDateForWeek(periodStartDate: Date, weekIndex: number, weekday: number): Date {
  const startWeekday = weekdayNumber(periodStartDate);
  const weekdayOffset = (weekday - startWeekday + 7) % 7;
  const next = new Date(periodStartDate);
  next.setDate(periodStartDate.getDate() + ((weekIndex - 1) * 7) + weekdayOffset);
  return next;
}

function isSameOrBefore(left: Date, right: Date): boolean {
  return left.getTime() <= right.getTime();
}

function addWeeks(startDate: Date, weeks: number): Date {
  const next = new Date(startDate);
  next.setDate(startDate.getDate() + weeks * 7);
  return next;
}

const ImportFormModel = ({
  open,
  onClose,
  data,
  onImport,
  isImporting = false,
}: ImportFormModelProps) => {
  const { t } = useTranslation();
  const [openConfirmClose, setOpenConfirmClose] = useState(false);
  const [validSchedules, setValidSchedules] = useState<IUploadTeachingCalenderItem[]>([]);
  const [invalidSchedules, setInvalidSchedules] = useState<IUploadTeachingCalenderInvalidRow[]>([]);
  const [classCode, setClassCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<RowSource>("valid");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingSchedule, setEditingSchedule] = useState<EditableTeachingSchedule | null>(null);
  const { data: classResponse, isLoading: isClassListLoading } = useGetClasses(
    {
      skip: 0,
      limit: 1000,
    }
  );
  const classList = classResponse?.data ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }
    setValidSchedules(data?.schedules ?? []);
    setInvalidSchedules(data?.invalid_schedules ?? []);
    setClassCode(data?.class_code ?? "");
    setStartDate(toInputDateValue(data?.period?.start_date));
    setEndDate(toInputDateValue(data?.period?.end_date));
  }, [open, data]);

  const rows: ImportPreviewRow[] = useMemo(() => {
    const validRows = validSchedules.map((schedule, index) => ({
      ...schedule,
      source: "valid" as const,
      index,
    }));
    const invalidRows = invalidSchedules.map((schedule, index) => ({
      ...schedule,
      source: "invalid" as const,
      index,
      row: schedule.row,
      errors: schedule.errors,
    }));
    return [...validRows, ...invalidRows];
  }, [validSchedules, invalidSchedules]);

  const renderImportError = (error: { code: string; params?: Record<string, string | number> }) => {
    return t(error.code, error.params);
  };

  const hasInvalidRows = invalidSchedules.length > 0;
  const hasNoValidRows = validSchedules.length === 0;
  const classExists = useMemo(
    () => {
      if (!classCode.trim() || isClassListLoading) {
        return true;
      }

      return classList.some((item) => item.class_code === classCode.trim());
    },
    [classCode, classList, isClassListLoading]
  );

  const periodWarnings = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }

    const periodStart = normalizeDate(startDate);
    const periodEnd = normalizeDate(endDate);

    return validSchedules
      .map((schedule, index) => {
        const studyWeekIndexes = parseStudyWeekIndexes(schedule.study_weeks);
        if (studyWeekIndexes.length === 0) {
          return null;
        }

        const invalidWeek = studyWeekIndexes.find((weekIndex) => {
          const matchedDate = resolveDateForWeek(periodStart, weekIndex, schedule.weeekday);
          return !isSameOrBefore(matchedDate, periodEnd);
        });

        if (!invalidWeek) {
          return null;
        }

        return {
          index: index + 1,
          weekIndex: invalidWeek,
          studyWeeks: schedule.study_weeks,
        };
      })
      .filter((item): item is { index: number; weekIndex: number; studyWeeks: string } => item !== null);
  }, [endDate, startDate, validSchedules]);

  const periodCoverageWarning = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }

    const periodStart = normalizeDate(startDate);
    const periodEnd = normalizeDate(endDate);
    const maxStudyWeek = validSchedules.reduce((max, schedule) => {
      const studyWeekIndexes = parseStudyWeekIndexes(schedule.study_weeks);
      if (studyWeekIndexes.length === 0) {
        return max;
      }
      return Math.max(max, ...studyWeekIndexes);
    }, 0);
    const expectedTermWeeks = 22;
    const expectedTermEnd = addWeeks(periodStart, expectedTermWeeks - 1);

    if (maxStudyWeek > expectedTermWeeks || periodEnd < expectedTermEnd) {
      return {
        expectedTermWeeks,
      };
    }

    return null;
  }, [endDate, startDate, validSchedules]);

  const importFeedbackMessages = useMemo(() => {
    const messages: { severity: "error" | "warning" | "info"; content: string }[] = [];

    if (!classExists && classCode) {
      messages.push({
        severity: "error",
        content: t("teachingSchedules.import.errors.classNotFound", { classCode }),
      });
    }

    if (periodWarnings.length > 0) {
      messages.push({
        severity: "error",
        content: t("teachingSchedules.import.errors.periodOverflow", { count: periodWarnings.length }),
      });
    }

    if (periodCoverageWarning) {
      messages.push({
        severity: "error",
        content: t("teachingSchedules.import.errors.termCoverage", {
          expectedTermWeeks: periodCoverageWarning.expectedTermWeeks,
        }),
      });
    }

    if (hasNoValidRows && !hasInvalidRows) {
      messages.push({
        severity: "warning",
        content: t("teachingSchedules.import.noValidRows"),
      });
    }

    if (hasInvalidRows) {
      messages.push({
        severity: "error",
        content: t("teachingSchedules.import.invalidRows", { count: invalidSchedules.length }),
      });
    }

    return messages;
  }, [
    classCode,
    classExists,
    hasInvalidRows,
    hasNoValidRows,
    invalidSchedules.length,
    periodCoverageWarning,
    periodWarnings.length,
    t,
  ]);

  const startDateValue = useMemo(() => {
    return startDate ? normalizeDate(startDate) : null;
  }, [startDate]);

  const endDateValue = useMemo(() => {
    return endDate ? normalizeDate(endDate) : null;
  }, [endDate]);

  const openEdit = (row: ImportPreviewRow) => {
    setEditingSource(row.source);
    setEditingIndex(row.index);
    setEditingSchedule({
      subject_id: row.subject_id ?? null,
      subject_code: row.subject_code ?? null,
      subject_name: row.subject_name ?? null,
      teacher_id: row.teacher_id ?? null,
      teacher_code: row.teacher_code ?? null,
      teacher_name: row.teacher_name ?? null,
      weeekday: row.weeekday,
      room_id: row.room_id ?? null,
      room_number: row.room_number ?? null,
      lesson_periods: row.lesson_periods,
      study_weeks: row.study_weeks,
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = (schedule: IUploadTeachingCalenderItem) => {
    if (editingIndex < 0) {
      setOpenEditDialog(false);
      return;
    }

    if (editingSource === "valid") {
      setValidSchedules((prev) => prev.map((item, index) => (index === editingIndex ? schedule : item)));
    } else {
      setInvalidSchedules((prev) => prev.filter((_, index) => index !== editingIndex));
      setValidSchedules((prev) => [...prev, schedule]);
    }

    setOpenEditDialog(false);
    setEditingSchedule(null);
    setEditingIndex(-1);
  };

  const handleImport = async () => {
    if (
      hasInvalidRows ||
      hasNoValidRows ||
      !classCode ||
      !startDate ||
      !endDate ||
      !classExists ||
      periodWarnings.length > 0 ||
      periodCoverageWarning !== null ||
      isClassListLoading
    ) {
      return;
    }

    await onImport({
      class_code: classCode,
      period: {
        start_date: `${startDate}T00:00:00`,
        end_date: `${endDate}T00:00:00`,
      },
      schedules: validSchedules,
    });
  };

  return (
    <Dialog open={open} onClose={() => setOpenConfirmClose(true)} fullWidth maxWidth="xl">
      <DialogTitle className="primary-dialog-title">{t("teachingSchedules.import.title")}</DialogTitle>
      <DialogContent dividers>
        {!data ? (
          <Typography>{t("teachingSchedules.import.noData")}</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>
              {t("teachingSchedules.import.fileName")}: {data.file_information.file_name}
            </Typography>
            <ImportFeedback messages={importFeedbackMessages} />

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              <MainAutocomplete
                options={classList}
                value={classCode}
                onChange={(id) => setClassCode(id)}
                getOptionLabel={(option) =>
                  option.class_name ? `${option.class_code} - ${option.class_name}` : option.class_code
                }
                getOptionId={(option) => option.class_code}
                placeholder={t("teachingSchedules.import.classCode")}
                disabled={isClassListLoading}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("teachingSchedules.import.startDate")}
                  value={startDateValue}
                  onChange={(newValue) => {
                    setStartDate(toInputDateValue(newValue?.toISOString() ?? null));
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("teachingSchedules.import.endDate")}
                  value={endDateValue}
                  onChange={(newValue) => {
                    setEndDate(toInputDateValue(newValue?.toISOString() ?? null));
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>

            <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader className="sticky-table" aria-label="import preview teaching schedules table">
                <TableHead className="primary-thead">
                  <TableRow className="primary-trow">
                    <TableCell className="primary-thead__cell" align="center">{t("teachingSchedules.import.table.subjectCode")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachingSchedules.import.table.subjectName")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachingSchedules.import.table.teacherCode")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachingSchedules.import.table.teacherName")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachingSchedules.import.table.weekday")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachingSchedules.import.table.lessonPeriods")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachingSchedules.import.table.studyWeeks")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachingSchedules.import.table.room")}</TableCell>
                    <TableCell className="primary-thead__cell" align="left">{t("teachingSchedules.import.table.errorReason")}</TableCell>
                    <TableCell className="primary-thead__cell" align="center">{t("teachingSchedules.import.table.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((schedule, index) => (
                    <TableRow key={`${schedule.subject_code || "schedule"}-${schedule.source}-${index}`} className="sticky-trow">
                      <TableCell className="sticky-tcell" align="center">{schedule.subject_code || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{schedule.subject_name || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.teacher_code || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="left">{schedule.teacher_name || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.weeekday || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.lesson_periods}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.study_weeks}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.room_number || ""}</TableCell>
                      <TableCell
                        className="sticky-tcell"
                        align="left"
                        sx={schedule.source === "invalid" ? { color: "#d32f2f", fontWeight: 600 } : undefined}
                      >
                        {schedule.source === "invalid"
                          ? schedule.errors?.map((error) => renderImportError(error)).join(", ") || ""
                          : ""}
                      </TableCell>
                      <TableCell className="sticky-tcell" align="center">
                        <IconButton className="primary-tcell__button--icon" onClick={() => openEdit(schedule)}>
                          <EditSquareIcon />
                        </IconButton>
                        <IconButton
                          className="primary-tcell__button--icon primary-tcell__button--delete"
                          onClick={() => {
                            if (schedule.source === "valid") {
                              setValidSchedules((prev) => prev.filter((_, i) => i !== schedule.index));
                            } else {
                              setInvalidSchedules((prev) => prev.filter((_, i) => i !== schedule.index));
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
        <Button onClick={() => setOpenConfirmClose(true)} className="button-cancel">{t("teachingSchedules.common.cancel")}</Button>
        <Button
          onClick={handleImport}
          disabled={
            isImporting ||
            isClassListLoading ||
            hasInvalidRows ||
            hasNoValidRows ||
            !classCode ||
            !startDate ||
            !endDate ||
            !classExists ||
            periodWarnings.length > 0 ||
            periodCoverageWarning !== null
          }
        >
          {isImporting ? t("teachingSchedules.import.importing") : t("teachingSchedules.import.importButton")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirmClose}
        title={t("teachingSchedules.confirm.exitTitle")}
        message={t("teachingSchedules.confirm.importExitMessage")}
        onCancel={() => setOpenConfirmClose(false)}
        onConfirm={() => {
          setOpenConfirmClose(false);
          onClose();
        }}
      />

      <ImportFormModelDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        initialSchedule={editingSchedule}
        onSave={handleSaveEdit}
      />
    </Dialog>
  );
};

export default ImportFormModel;
