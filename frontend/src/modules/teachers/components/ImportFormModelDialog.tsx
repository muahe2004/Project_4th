import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { ITeacherFileData } from "../types";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";

interface ImportFormModelDialogProps {
  open: boolean;
  onClose: () => void;
  initialTeacher: ITeacherFileData | null;
  onSave: (teacher: ITeacherFileData) => void;
}

const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return value.toString().slice(0, 10);
};

const ImportFormModelDialog = ({
  open,
  onClose,
  initialTeacher,
  onSave,
}: ImportFormModelDialogProps) => {
  const [teacher, setTeacher] = useState<ITeacherFileData>({
    teacher_code: null,
    name: null,
    gender: null,
    date_of_birth: null,
    email: null,
    phone: null,
    address: null,
  });
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultTeacher: ITeacherFileData = {
      teacher_code: null,
      name: null,
      gender: null,
      date_of_birth: null,
      email: null,
      phone: null,
      address: null,
    };

    const nextTeacher = initialTeacher ?? defaultTeacher;
    setTeacher(nextTeacher);
    setDateOfBirth(nextTeacher.date_of_birth ? new Date(nextTeacher.date_of_birth) : null);
  }, [open, initialTeacher]);

  const setField = (field: keyof ITeacherFileData, value: string) => {
    const nextValue = field === "date_of_birth"
      ? (value ? `${value}T00:00:00` : null)
      : (value || null);

    setTeacher((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="primary-dialog-title">Chỉnh sửa giảng viên import</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} className="myprofile-form">
          <Grid size={6}>
            <LabelPrimary value="Mã giảng viên" required />
            <TextField
              value={teacher.teacher_code || ""}
              onChange={(event) => setField("teacher_code", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Họ và tên" required />
            <TextField
              value={teacher.name || ""}
              onChange={(event) => setField("name", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Giới tính" />
            <Select
              value={teacher.gender || "3"}
              onChange={(event) => setField("gender", String(event.target.value))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            >
              <MenuItem value="1">Nam</MenuItem>
              <MenuItem value="2">Nữ</MenuItem>
              <MenuItem value="3">Khác</MenuItem>
            </Select>
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Sinh nhật" />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={dateOfBirth}
                onChange={(newValue) => {
                  setDateOfBirth(newValue);
                  setField("date_of_birth", newValue ? toDateInputValue(newValue.toISOString()) : "");
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={6}>
            <LabelPrimary required value="Email" />
            <TextField
              value={teacher.email || ""}
              onChange={(event) => setField("email", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Số điện thoại" />
            <TextField
              value={teacher.phone || ""}
              onChange={(event) => setField("phone", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={12}>
            <LabelPrimary value="Nơi sinh" />
            <TextField
              value={teacher.address || ""}
              onChange={(event) => setField("address", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">Huỷ</Button>
        <Button onClick={() => onSave(teacher)}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFormModelDialog;
