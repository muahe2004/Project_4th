import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";

import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import LabelPrimary from "../../../components/Label/Label";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { STATUS } from "../../../constants/status";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { hasObjectChanged } from "../../../utils/checkChangeValues";
import { useCreateSubject } from "../apis/addSubject";
import { useUpdateSubject } from "../apis/updateSubject";
import type { ISubject, ISubjectCreate, ISubjectUpdate } from "../types";
import { useTranslation } from "react-i18next";
import { getRequiredError } from "../../../utils/validation/fieldErrors";

interface SubjectFormModelProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: ISubject;
  onClose: () => void;
}

export function SubjectFormModel({
  open,
  mode,
  initialValues,
  onClose,
}: SubjectFormModelProps) {
  const { t } = useTranslation();
  const subjectId = initialValues?.id;
  const { showSnackbar } = useSnackbar();

  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [credit, setCredit] = useState("");
  const [description, setDescription] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [openConfirmSave, setOpenConfirmSave] = useState(false);
  const [subjectCodeError, setSubjectCodeError] = useState("");
  const [subjectNameError, setSubjectNameError] = useState("");
  const [creditError, setCreditError] = useState("");

  const { mutateAsync: createSubject } = useCreateSubject({});
  const { mutateAsync: updateSubject } = useUpdateSubject();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setSubjectCode(initialValues.subject_code || "");
      setSubjectName(initialValues.name || "");
      setCredit(String(initialValues.credit || ""));
      setDescription(initialValues.description || "");
    } else {
      setSubjectCode("");
      setSubjectName("");
      setCredit("");
      setDescription("");
    }
    setIsChanged(false);
    setSubjectCodeError("");
    setSubjectNameError("");
    setCreditError("");
  }, [mode, initialValues, open]);

  const currentValues = {
    subject_code: subjectCode.trim(),
    name: subjectName.trim(),
    credit: Number(credit),
    description: description.trim(),
  };

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      const compareTarget: ISubject = {
        subject_code: initialValues.subject_code,
        name: initialValues.name,
        credit: initialValues.credit,
        description: initialValues.description ?? "",
        status: initialValues.status,
      };

      setIsChanged(
        hasObjectChanged(
          currentValues,
          {
            subject_code: compareTarget.subject_code,
            name: compareTarget.name,
            credit: compareTarget.credit,
            description: compareTarget.description ?? "",
          },
          [],
          []
        )
      );
      return;
    }

    const hasInput =
      currentValues.subject_code !== "" ||
      currentValues.name !== "" ||
      credit.trim() !== "" ||
      currentValues.description !== "";

    setIsChanged(hasInput);
  }, [mode, initialValues, subjectCode, subjectName, credit, description]);

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    isChanged,
    onClose,
  });

  const validateForm = (): boolean => {
    const codeError = getRequiredError(subjectCode, t("subjects.form.errors.subjectCodeRequired"));
    const nameError = getRequiredError(subjectName, t("subjects.form.errors.subjectNameRequired"));

    const creditValue = Number(credit);
    const creditRequiredError = getRequiredError(credit, t("subjects.form.errors.creditRequired"));
    const creditInvalidError =
      creditRequiredError || Number.isInteger(creditValue) && creditValue > 0
        ? ""
        : t("subjects.form.errors.creditInvalid");

    setSubjectCodeError(codeError);
    setSubjectNameError(nameError);
    setCreditError(creditRequiredError || creditInvalidError);

    return !codeError && !nameError && !(creditRequiredError || creditInvalidError);
  };

  const handleSubmitClick = () => {
    if (!validateForm()) {
      return;
    }

    if (mode === "add") {
      void handleConfirmSave();
      return;
    }

    if (mode === "edit" && !isChanged) {
      setOpenConfirm(true);
      return;
    }

    setOpenConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const basePayload = {
        subject_code: subjectCode.trim(),
        name: subjectName.trim(),
        credit: Number(credit),
        description: description.trim() || null,
      };

      if (mode === "add") {
        const payload: ISubjectCreate = {
          ...basePayload,
          status: STATUS.ACTIVE,
        };
        await createSubject(payload);
      } else if (mode === "edit" && subjectId) {
        const payload: ISubjectUpdate = {
          ...basePayload,
          status: initialValues?.status ?? STATUS.ACTIVE,
          updated_at: dayjs().format("YYYY-MM-DD"),
        };
        await updateSubject({ id: subjectId, data: payload });
      }

      showSnackbar(
        mode === "add"
          ? t("subjects.messages.addSuccess")
          : t("subjects.messages.updateSuccess"),
        "success"
      );
      setOpenConfirmSave(false);
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar(t("subjects.messages.genericError"), "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseClick}
      className="primary-dialog department-form"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="primary-dialog-title">
        {mode === "add" ? t("subjects.form.titleAdd") : t("subjects.form.titleEdit")}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        <LabelPrimary value={t("subjects.form.labels.subjectCode")} required />
        <TextField
          value={subjectCode}
          onChange={(event) => {
            setSubjectCode(event.target.value);
            if (subjectCodeError) setSubjectCodeError("");
          }}
          onBlur={() =>
            setSubjectCodeError(
              getRequiredError(subjectCode, t("subjects.form.errors.subjectCodeRequired"))
            )
          }
          onFocus={() => setSubjectCodeError("")}
          error={Boolean(subjectCodeError)}
          helperText={subjectCodeError}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value={t("subjects.form.labels.subjectName")} required />
        <TextField
          value={subjectName}
          onChange={(event) => {
            setSubjectName(event.target.value);
            if (subjectNameError) setSubjectNameError("");
          }}
          onBlur={() =>
            setSubjectNameError(
              getRequiredError(subjectName, t("subjects.form.errors.subjectNameRequired"))
            )
          }
          onFocus={() => setSubjectNameError("")}
          error={Boolean(subjectNameError)}
          helperText={subjectNameError}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value={t("subjects.form.labels.credit")} required />
        <TextField
          value={credit}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (!/^\d*$/.test(nextValue)) {
              return;
            }
            setCredit(nextValue);
            if (creditError) setCreditError("");
          }}
          onBlur={() => {
            const requiredError = getRequiredError(credit, t("subjects.form.errors.creditRequired"));
            if (requiredError) {
              setCreditError(requiredError);
              return;
            }
            const creditValue = Number(credit);
            setCreditError(
              Number.isInteger(creditValue) && creditValue > 0
                ? ""
                : t("subjects.form.errors.creditInvalid")
            );
          }}
          onFocus={() => setCreditError("")}
          error={Boolean(creditError)}
          helperText={creditError}
          fullWidth
          variant="outlined"
          type="number"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value={t("subjects.form.labels.description")} />
        <TextField
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          className="main-text__field"
        />
      </DialogContent>
      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          {t("subjects.common.cancel")}
        </Button>
        <Button onClick={handleSubmitClick} variant="contained">
          {mode === "add" ? t("subjects.common.add") : t("subjects.common.save")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title={t("subjects.confirm.exitTitle")}
        message={t("subjects.confirm.exitMessage")}
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />

      {mode === "edit" && (
        <ConfirmDialog
          open={openConfirmSave}
          title={t("subjects.confirm.saveTitle")}
          message={t("subjects.confirm.saveMessage")}
          onConfirm={handleConfirmSave}
          onCancel={() => setOpenConfirmSave(false)}
        />
      )}
    </Dialog>
  );
}

export default SubjectFormModel;
