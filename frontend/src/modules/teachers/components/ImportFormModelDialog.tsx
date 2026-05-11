import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      <DialogTitle className="primary-dialog-title">{t("teachers.import.editTitle")}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} className="myprofile-form">
          <Grid size={6}>
            <LabelPrimary value={t("teachers.form.teacherCode")} required />
            <TextField
              value={teacher.teacher_code || ""}
              onChange={(event) => setField("teacher_code", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("teachers.form.teacherName")} required />
            <TextField
              value={teacher.name || ""}
              onChange={(event) => setField("name", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("teachers.form.gender")} />
            <Select
              value={teacher.gender || "3"}
              onChange={(event) => setField("gender", String(event.target.value))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            >
              <MenuItem value="1">{t("common.male")}</MenuItem>
              <MenuItem value="2">{t("common.female")}</MenuItem>
              <MenuItem value="3">{t("common.other")}</MenuItem>
            </Select>
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("teachers.form.dateOfBirth")} />
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
            <LabelPrimary required value={t("teachers.form.email")} />
            <TextField
              value={teacher.email || ""}
              onChange={(event) => setField("email", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("teachers.form.phone")} />
            <TextField
              value={teacher.phone || ""}
              onChange={(event) => setField("phone", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={12}>
            <LabelPrimary value={t("teachers.form.placeOfOrigin")} />
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
        <Button onClick={onClose} className="button-cancel">{t("common.cancel")}</Button>
        <Button onClick={() => onSave(teacher)}>{t("common.save")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFormModelDialog;
