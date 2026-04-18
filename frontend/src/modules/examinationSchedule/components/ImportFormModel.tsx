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
import type {
  IImportExaminationScheduleItem,
  IImportExaminationSchedulePayload,
  IUploadExaminationScheduleInvalidRow,
  IUploadExaminationScheduleItem,
  IUploadExaminationScheduleResponse,
} from "../types";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import ImportFormModelDialog from "./ImportFormModelDialog";

interface ImportFormModelProps {
  open: boolean;
  onClose: () => void;
  data: IUploadExaminationScheduleResponse | null;
  onImport: (payload: IImportExaminationSchedulePayload) => Promise<void>;
  isImporting?: boolean;
}

type RowSource = "valid" | "invalid";

type ImportPreviewRow = IUploadExaminationScheduleItem & {
  source: RowSource;
  row?: number;
  errors?: string[];
  index: number;
};

type EditableExaminationSchedule = IImportExaminationScheduleItem & {
  subject_code?: string | null;
  subject_name?: string | null;
  class_code?: string | null;
  class_name?: string | null;
  invigilator_1_code?: string | null;
  invigilator_1_name?: string | null;
  invigilator_2_code?: string | null;
  invigilator_2_name?: string | null;
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

const toInputTimeValue = (dateValue?: string | null) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const hours = `${parsedDate.getHours()}`.padStart(2, "0");
  const minutes = `${parsedDate.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

const normalizeDateTime = (dateValue: string, timeValue: string) =>
  `${dateValue}T${timeValue.length === 5 ? `${timeValue}:00` : timeValue}`;

const ImportFormModel = ({
  open,
  onClose,
  data,
  onImport,
  isImporting = false,
}: ImportFormModelProps) => {
  const [openConfirmClose, setOpenConfirmClose] = useState(false);
  const [validSchedules, setValidSchedules] = useState<EditableExaminationSchedule[]>([]);
  const [invalidSchedules, setInvalidSchedules] = useState<IUploadExaminationScheduleInvalidRow[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<RowSource>("valid");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingSchedule, setEditingSchedule] = useState<EditableExaminationSchedule | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidSchedules(
      (data?.schedules ?? []).map((schedule) => ({
        subject_id: schedule.subject_id ?? "",
        subject_code: schedule.subject_code ?? "",
        subject_name: schedule.subject_name ?? "",
        class_id: schedule.class_id ?? "",
        class_code: schedule.class_code ?? "",
        class_name: schedule.class_name ?? "",
        invigilator_1_id: schedule.invigilator_1_id ?? null,
        invigilator_1_code: schedule.invigilator_1_code ?? "",
        invigilator_1_name: schedule.invigilator_1_name ?? "",
        invigilator_2_id: schedule.invigilator_2_id ?? null,
        invigilator_2_code: schedule.invigilator_2_code ?? "",
        invigilator_2_name: schedule.invigilator_2_name ?? "",
        room_id: schedule.room_id ?? null,
        room_number: schedule.room_number ?? null,
        date: schedule.date ?? "",
        start_time: schedule.start_time ?? "",
        end_time: schedule.end_time ?? "",
        schedule_type: schedule.schedule_type ?? null,
      }))
    );
    setInvalidSchedules(data?.invalid_schedules ?? []);
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

  const hasInvalidRows = invalidSchedules.length > 0;
  const hasNoValidRows = validSchedules.length === 0;

  const openEdit = (row: ImportPreviewRow) => {
    setEditingSource(row.source);
    setEditingIndex(row.index);
    setEditingSchedule({
      subject_id: row.subject_id ?? "",
      subject_code: row.subject_code ?? "",
      subject_name: row.subject_name ?? "",
      class_id: row.class_id ?? "",
      class_code: row.class_code ?? "",
      class_name: row.class_name ?? "",
      date: row.date ?? "",
      start_time: row.start_time ?? "",
      end_time: row.end_time ?? "",
      room_id: row.room_id ?? null,
      room_number: row.room_number ?? null,
      schedule_type: row.schedule_type ?? null,
      invigilator_1_code: row.invigilator_1_code ?? "",
      invigilator_1_name: row.invigilator_1_name ?? "",
      invigilator_1_id: row.invigilator_1_id ?? null,
      invigilator_2_code: row.invigilator_2_code ?? "",
      invigilator_2_name: row.invigilator_2_name ?? "",
      invigilator_2_id: row.invigilator_2_id ?? null,
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = (schedule: EditableExaminationSchedule) => {
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
    if (hasInvalidRows || hasNoValidRows) {
      return;
    }

    await onImport({
      schedules: validSchedules.map((item) => ({
        subject_id: item.subject_id ?? "",
        class_id: item.class_id ?? "",
        date: item.date ? normalizeDateTime(toInputDateValue(item.date), toInputTimeValue(item.date)) : "",
        start_time: item.start_time
          ? normalizeDateTime(toInputDateValue(item.date), toInputTimeValue(item.start_time))
          : "",
        end_time: item.end_time
          ? normalizeDateTime(toInputDateValue(item.date), toInputTimeValue(item.end_time))
          : "",
        room_id: item.room_id ?? null,
        schedule_type: item.schedule_type ?? null,
        invigilator_1_id: item.invigilator_1_id ?? null,
        invigilator_2_id: item.invigilator_2_id ?? null,
      })),
    });
  };

  return (
    <Dialog open={open} onClose={() => setOpenConfirmClose(true)} fullWidth maxWidth="xl">
      <DialogTitle className="primary-dialog-title">Import Examination Schedule Preview</DialogTitle>
      <DialogContent dividers>
        {!data ? (
          <Typography>Không có dữ liệu import.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>
              File name: {data.file_information?.file_name ?? ""}
            </Typography>
            {hasNoValidRows && !hasInvalidRows && (
              <Typography sx={{ color: "#d32f2f", fontWeight: 600 }}>
                Không có dòng hợp lệ để import.
              </Typography>
            )}
            {hasInvalidRows && (
              <Typography sx={{ color: "#d32f2f", fontWeight: 600 }}>
                Còn {invalidSchedules.length} dòng lỗi, vui lòng sửa trước khi import.
              </Typography>
            )}

            <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader className="sticky-table" aria-label="import preview examination schedules table">
                <TableHead className="primary-thead">
                  <TableRow className="primary-trow">
                    <TableCell className="primary-thead__cell" align="center">Mã MH</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Mã Lớp</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Ngày thi</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Giờ bắt đầu</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Giờ kết thúc</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Phòng</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Loại</TableCell>
                    <TableCell className="primary-thead__cell" align="left">Lý do lỗi</TableCell>
                    <TableCell className="primary-thead__cell" align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((schedule, index) => (
                    <TableRow key={`${schedule.subject_id || "schedule"}-${schedule.source}-${index}`} className="sticky-trow">
                      <TableCell className="sticky-tcell" align="center">{schedule.subject_code || schedule.subject_id || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.class_code || schedule.class_id || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.date ? toInputDateValue(schedule.date) : ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.start_time ? toInputTimeValue(schedule.start_time) : ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.end_time ? toInputTimeValue(schedule.end_time) : ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.room_number || schedule.room_id || ""}</TableCell>
                      <TableCell className="sticky-tcell" align="center">{schedule.schedule_type || ""}</TableCell>
                      <TableCell
                        className="sticky-tcell"
                        align="left"
                        sx={schedule.source === "invalid" ? { color: "#d32f2f", fontWeight: 600 } : undefined}
                      >
                        {schedule.source === "invalid" ? schedule.errors?.join("; ") : ""}
                      </TableCell>
                      <TableCell className="sticky-tcell" align="center">
                        <IconButton className="primary-tcell__button--icon" onClick={() => openEdit(schedule)}>
                          <EditSquareIcon />
                        </IconButton>
                        {schedule.source === "invalid" && (
                          <IconButton
                            className="primary-tcell__button--icon primary-tcell__button--delete"
                            onClick={() => {
                              setInvalidSchedules((prev) => prev.filter((_, rowIndex) => rowIndex !== schedule.index));
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
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
        <Button onClick={handleImport} disabled={isImporting || hasInvalidRows || hasNoValidRows}>
          {isImporting ? "Importing..." : "Import"}
        </Button>
      </DialogActions>

      <ImportFormModelDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        initialSchedule={editingSchedule}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        open={openConfirmClose}
        title="Xác nhận thoát"
        message="Bạn có chắc muốn thoát form import?"
        onConfirm={onClose}
        onCancel={() => setOpenConfirmClose(false)}
      />
    </Dialog>
  );
};

export default ImportFormModel;
