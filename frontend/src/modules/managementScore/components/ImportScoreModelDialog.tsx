import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import type { IScoreUploadRow } from "../types";

interface ImportScoreModelDialogProps {
  open: boolean;
  onClose: () => void;
  initialScore: IScoreUploadRow | null;
  onSave: (score: IScoreUploadRow) => void;
}

const toStringValue = (value?: string | number | null) => (value === null || value === undefined ? "" : String(value));

const ImportScoreModelDialog = ({ open, onClose, initialScore, onSave }: ImportScoreModelDialogProps) => {
  const { t } = useTranslation();
  const [score, setScore] = useState<IScoreUploadRow>({
    row: 0,
    class_code: null,
    student_code: null,
    student_name: null,
    family_name: null,
    given_name: null,
    d1: null,
    d2: null,
    thi: null,
    tbm: null,
    note: null,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setScore(
      initialScore ?? {
        row: 0,
        class_code: null,
        student_code: null,
        student_name: null,
        family_name: null,
        given_name: null,
        d1: null,
        d2: null,
        thi: null,
        tbm: null,
        note: null,
      }
    );
  }, [open, initialScore]);

  const setField = (field: keyof IScoreUploadRow, value: string) => {
    const nextValue = value === "" ? null : value;
    setScore((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="primary-dialog-title">{t("managementScore.import.editTitle")}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} className="myprofile-form">
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.classCode")} required />
            <TextField
              value={score.class_code || ""}
              onChange={(event) => setField("class_code", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.studentCode")} required />
            <TextField
              value={score.student_code || ""}
              onChange={(event) => setField("student_code", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.familyName")} />
            <TextField
              value={score.family_name || ""}
              onChange={(event) => setField("family_name", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.givenName")} />
            <TextField
              value={score.given_name || ""}
              onChange={(event) => setField("given_name", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.d1")} required />
            <TextField
              value={toStringValue(score.d1)}
              onChange={(event) => setField("d1", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.d2")} required />
            <TextField
              value={toStringValue(score.d2)}
              onChange={(event) => setField("d2", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.thi")} required />
            <TextField
              value={toStringValue(score.thi)}
              onChange={(event) => setField("thi", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
          <Grid size={6}>
            <LabelPrimary value={t("managementScore.import.form.tbm")} />
            <TextField
              value={toStringValue(score.tbm)}
              onChange={(event) => setField("tbm", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">{t("common.cancel")}</Button>
        <Button
          onClick={() =>
            onSave({
              ...score,
              d1: score.d1 === null ? null : Number(score.d1),
              d2: score.d2 === null ? null : Number(score.d2),
              thi: score.thi === null ? null : Number(score.thi),
              tbm: score.tbm === null ? null : Number(score.tbm),
            })
          }
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportScoreModelDialog;
