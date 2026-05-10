import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";

import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import {
  COMPONENT_TYPE_FINAL_ALIASES,
  COMPONENT_TYPE_MIDDLE_ALIASES,
} from "../../grades/types";
import type { ScoreTableRow } from "../../grades/types";
import { useAddScore } from "../apis/addScore";
import { useGetScoreComponents } from "../apis/getScoreComponents";
import { useUpdateScore } from "../apis/updateScore";

interface EditScoreDialogProps {
  open: boolean;
  row: ScoreTableRow | null;
  onClose: () => void;
}

type ScoreFormValues = {
  exam1: string;
  exam2: string;
  exam3: string;
  recheck1: string;
  recheck2: string;
  recheck3: string;
};

const toInputValue = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const buildFormValues = (row: ScoreTableRow | null): ScoreFormValues => ({
  exam1: toInputValue(row?.exam1),
  exam2: toInputValue(row?.exam2),
  exam3: toInputValue(row?.exam3),
  recheck1: toInputValue(row?.recheck1),
  recheck2: toInputValue(row?.recheck2),
  recheck3: toInputValue(row?.recheck3),
});

const hasChanges = (current: ScoreFormValues, initial: ScoreFormValues) => {
  return (
    current.exam1 !== initial.exam1 ||
    current.exam2 !== initial.exam2 ||
    current.exam3 !== initial.exam3 ||
    current.recheck1 !== initial.recheck1 ||
    current.recheck2 !== initial.recheck2 ||
    current.recheck3 !== initial.recheck3
  );
};

const parseScore = (value: string) => Number(value);

const normalizeText = (value: string | null | undefined): string => (value ?? "").toUpperCase().trim();

const getComponentAliasesForField = (row: ScoreTableRow, key: keyof ScoreFormValues) => {
  if (row.score_mode === "retake") {
    if (key === "recheck3") {
      return COMPONENT_TYPE_FINAL_ALIASES;
    }
    return COMPONENT_TYPE_MIDDLE_ALIASES;
  }

  if (key === "exam3") {
    return COMPONENT_TYPE_FINAL_ALIASES;
  }

  return COMPONENT_TYPE_MIDDLE_ALIASES;
};

const getChangedFields = (current: ScoreFormValues, initial: ScoreFormValues) => {
  const fields: Array<{
    key: keyof ScoreFormValues;
    value: string;
  }> = [];

  if (current.exam1 !== initial.exam1) fields.push({ key: "exam1", value: current.exam1 });
  if (current.exam2 !== initial.exam2) fields.push({ key: "exam2", value: current.exam2 });
  if (current.exam3 !== initial.exam3) fields.push({ key: "exam3", value: current.exam3 });
  if (current.recheck1 !== initial.recheck1) fields.push({ key: "recheck1", value: current.recheck1 });
  if (current.recheck2 !== initial.recheck2) fields.push({ key: "recheck2", value: current.recheck2 });
  if (current.recheck3 !== initial.recheck3) fields.push({ key: "recheck3", value: current.recheck3 });

  return fields;
};

export function EditScoreDialog({ open, row, onClose }: EditScoreDialogProps) {
  const { showSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState<ScoreFormValues>(buildFormValues(row));
  const { mutateAsync: updateScore, isPending } = useUpdateScore();
  const { mutateAsync: addScore } = useAddScore();
  const { data: scoreComponents = [] } = useGetScoreComponents({ enabled: open });

  const initialValues = buildFormValues(row);
  const { handleCloseClick } = useConfirmCloseForm({
    mode: "edit",
    isChanged: hasChanges(formValues, initialValues),
    onClose,
  });

  useEffect(() => {
    setFormValues(buildFormValues(row));
  }, [row, open]);

  const handleSubmitClick = () => {
    if (!hasChanges(formValues, initialValues)) {
      showSnackbar("Không có thay đổi nào để lưu.", "info");
      return;
    }

    if (!row) {
      return;
    }

    const changedFields = getChangedFields(formValues, initialValues);
    if (changedFields.length === 0) {
      showSnackbar("Không có thay đổi nào để lưu.", "info");
      return;
    }

    const targetMap =
      row.score_mode === "retake"
        ? {
            recheck1: { id: row.recheck1Id, scoreComponentId: row.recheck1ScoreComponentId },
            recheck2: { id: row.recheck2Id, scoreComponentId: row.recheck2ScoreComponentId },
            recheck3: { id: row.recheck3Id, scoreComponentId: row.recheck3ScoreComponentId },
          }
        : {
            exam1: { id: row.exam1Id, scoreComponentId: row.exam1ScoreComponentId },
            exam2: { id: row.exam2Id, scoreComponentId: row.exam2ScoreComponentId },
            exam3: { id: row.exam3Id, scoreComponentId: row.exam3ScoreComponentId },
          };

    const requests = changedFields.map((field) => {
      const targetMeta = targetMap[field.key as keyof typeof targetMap];
      const candidateAliases = getComponentAliasesForField(row, field.key);
      const scoreComponentId =
        targetMeta?.scoreComponentId ??
        scoreComponents.find((component) =>
          candidateAliases.includes(normalizeText(component.component_type))
        )?.id;

      if (!scoreComponentId) {
        throw new Error(`Không tìm thấy loại điểm để xử lý: ${field.key}`);
      }

      const score = parseScore(field.value);

      if (targetMeta?.id) {
        console.log("update score", { id: targetMeta.id, score: field.value });
        return updateScore({
          id: targetMeta.id,
          data: { score, score_component_id: scoreComponentId },
        });
      }

      if (!row.student_id || !row.subject_id || !row.academic_term_id) {
        throw new Error("Thiếu payload nền để tạo mới điểm.");
      }

      console.log("add score", {
        student_id: row.student_id,
        subject_id: row.subject_id,
        academic_term_id: row.academic_term_id,
        score: field.value,
      });

      return addScore({
        student_id: row.student_id,
        subject_id: row.subject_id,
        academic_term_id: row.academic_term_id,
        score_component_id: scoreComponentId,
        score,
        attempt: row.score_mode === "retake" ? 2 : 1,
        score_type: row.score_mode === "retake" ? "Retake" : "Official",
        status: "ACTIVE",
      });
    });

    void Promise.all(requests)
      .then(() => {
        showSnackbar("Đã lưu thay đổi điểm.", "success");
        onClose();
      })
      .catch((error) => {
        console.error(error);
        showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseClick}
      className="primary-dialog score-dialog"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="primary-dialog-title">EDIT SCORE</DialogTitle>

      <DialogContent className="primary-dialog-content">
        {row ? (
          <Grid container spacing={2}>
            <Grid size={4}>
              <LabelPrimary value="Mã học phần" required />
              <TextField
                value={row.subject_code}
                fullWidth
                variant="outlined"
                className="main-text__field primary-dialog-input"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value="Tên học phần" />
              <TextField
                value={row.subject_name}
                fullWidth
                variant="outlined"
                className="main-text__field primary-dialog-input"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value="Số tín chỉ" />
              <TextField
                value={String(row.credits)}
                fullWidth
                variant="outlined"
                className="main-text__field primary-dialog-input"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {row.score_mode === "retake" ? (
              <>
                <Grid size={4}>
                  <LabelPrimary value="Điểm học lại Đ1" />
                  <TextField
                    value={formValues.recheck1}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, recheck1: event.target.value }))
                    }
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                  />
                </Grid>

                <Grid size={4}>
                  <LabelPrimary value="Điểm học lại Đ2" />
                  <TextField
                    value={formValues.recheck2}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, recheck2: event.target.value }))
                    }
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                  />
                </Grid>

                <Grid size={4}>
                  <LabelPrimary value="Điểm học lại Thi" />
                  <TextField
                    value={formValues.recheck3}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, recheck3: event.target.value }))
                    }
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid size={4}>
                  <LabelPrimary value="Điểm thành phần Đ1" />
                  <TextField
                    value={formValues.exam1}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, exam1: event.target.value }))
                    }
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                  />
                </Grid>

                <Grid size={4}>
                  <LabelPrimary value="Điểm thành phần Đ2" />
                  <TextField
                    value={formValues.exam2}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, exam2: event.target.value }))
                    }
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                  />
                </Grid>

                <Grid size={4}>
                  <LabelPrimary value="Điểm thành phần Thi" />
                  <TextField
                    value={formValues.exam3}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, exam3: event.target.value }))
                    }
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                  />
                </Grid>
              </>
            )}
          </Grid>
        ) : null}
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          HỦY
        </Button>
        <Button
          onClick={handleSubmitClick}
          variant="contained"
          disabled={!hasChanges(formValues, initialValues) || isPending}
        >
          LƯU
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditScoreDialog;
