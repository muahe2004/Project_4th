import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";

import type { ITrainingProgramFileSubjectData } from "../types";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";

interface ImportFormModelDialogProps {
  open: boolean;
  onClose: () => void;
  initialSubject: ITrainingProgramFileSubjectData | null;
  onSave: (subject: ITrainingProgramFileSubjectData) => void;
}

const ImportFormModelDialog = ({
  open,
  onClose,
  initialSubject,
  onSave,
}: ImportFormModelDialogProps) => {
  const [subject, setSubject] = useState<ITrainingProgramFileSubjectData>({
    subject_code: null,
    subject_name: null,
    term: null,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultSubject: ITrainingProgramFileSubjectData = {
      subject_code: null,
      subject_name: null,
      term: null,
    };

    setSubject(initialSubject ?? defaultSubject);
  }, [open, initialSubject]);

  const setField = (field: keyof ITrainingProgramFileSubjectData, value: string) => {
    const nextValue = field === "term"
      ? (value ? Number(value) : null)
      : (value || null);

    setSubject((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="primary-dialog-title">Chỉnh sửa môn học import</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} className="myprofile-form">
          <Grid size={6}>
            <LabelPrimary value="Mã môn" required />
            <TextField
              value={subject.subject_code || ""}
              onChange={(event) => setField("subject_code", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Tên môn" required />
            <TextField
              value={subject.subject_name || ""}
              onChange={(event) => setField("subject_name", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value="Học kỳ" required />
            <TextField
              type="number"
              inputProps={{ min: 1 }}
              value={subject.term ?? ""}
              onChange={(event) => setField("term", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">Huỷ</Button>
        <Button onClick={() => onSave(subject)}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFormModelDialog;
