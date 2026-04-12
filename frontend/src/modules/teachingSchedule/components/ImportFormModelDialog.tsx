import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import type { IUploadTeachingCalenderItem } from "../types";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";

interface ImportFormModelDialogProps {
  open: boolean;
  onClose: () => void;
  initialSchedule: IUploadTeachingCalenderItem | null;
  onSave: (schedule: IUploadTeachingCalenderItem) => void;
}

const ImportFormModelDialog = ({
  open,
  onClose,
  initialSchedule,
  onSave,
}: ImportFormModelDialogProps) => {
  const [schedule, setSchedule] = useState<IUploadTeachingCalenderItem>({
    subject_id: null,
    subject_code: null,
    subject_name: null,
    teacher_id: null,
    teacher_code: null,
    teacher_name: null,
    weeekday: 2,
    room_id: null,
    room_number: null,
    lesson_periods: "",
    study_weeks: "",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setSchedule(
      initialSchedule ?? {
        subject_id: null,
        subject_code: null,
        subject_name: null,
        teacher_id: null,
        teacher_code: null,
        teacher_name: null,
        weeekday: 2,
        room_id: null,
        room_number: null,
        lesson_periods: "",
        study_weeks: "",
      }
    );
  }, [open, initialSchedule]);

  const setField = (field: keyof IUploadTeachingCalenderItem, value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [field]:
        field === "weeekday" || field === "room_number"
          ? Number(value)
          : value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="primary-dialog-title">Chỉnh sửa lịch dạy import</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} className="myprofile-form">
          <Grid size={6}>
            <LabelPrimary value="Mã môn học" required />
            <TextField
              value={schedule.subject_code || ""}
              onChange={(event) => setField("subject_code", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Tên môn học" />
            <TextField
              value={schedule.subject_name || ""}
              onChange={(event) => setField("subject_name", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Mã giảng viên" required />
            <TextField
              value={schedule.teacher_code || ""}
              onChange={(event) => setField("teacher_code", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Tên giảng viên" />
            <TextField
              value={schedule.teacher_name || ""}
              onChange={(event) => setField("teacher_name", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={4}>
            <LabelPrimary value="Thứ" required />
            <TextField
              value={schedule.weeekday}
              onChange={(event) => setField("weeekday", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={4}>
            <LabelPrimary value="Phòng" required />
            <TextField
              value={schedule.room_number || ""}
              onChange={(event) => setField("room_number", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={4}>
            <LabelPrimary value="Tiết học" required />
            <TextField
              value={schedule.lesson_periods}
              onChange={(event) => setField("lesson_periods", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={12}>
            <LabelPrimary value="Tuần học" required />
            <TextField
              value={schedule.study_weeks}
              onChange={(event) => setField("study_weeks", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">Huỷ</Button>
        <Button onClick={() => onSave(schedule)}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFormModelDialog;
