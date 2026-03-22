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
  const subjectId = initialValues?.id;
  const { showSnackbar } = useSnackbar();

  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [credit, setCredit] = useState("");
  const [description, setDescription] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [openConfirmSave, setOpenConfirmSave] = useState(false);

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
    if (!subjectCode.trim()) {
      showSnackbar("Mã học phần là bắt buộc", "error");
      return false;
    }
    if (!subjectName.trim()) {
      showSnackbar("Tên học phần là bắt buộc", "error");
      return false;
    }

    const creditValue = Number(credit);
    if (!Number.isInteger(creditValue) || creditValue <= 0) {
      showSnackbar("Số tín chỉ phải là số nguyên dương", "error");
      return false;
    }

    return true;
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
          ? "Thêm học phần thành công!"
          : "Cập nhật học phần thành công!",
        "success"
      );
      setOpenConfirmSave(false);
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
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
        {mode === "add" ? "ADD SUBJECT" : "SỬA HỌC PHẦN"}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        <LabelPrimary value="Mã học phần" required />
        <TextField
          value={subjectCode}
          onChange={(event) => setSubjectCode(event.target.value)}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value="Tên học phần" required />
        <TextField
          value={subjectName}
          onChange={(event) => setSubjectName(event.target.value)}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value="Số tín chỉ" required />
        <TextField
          value={credit}
          onChange={(event) => setCredit(event.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value="Mô tả" />
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
          Hủy
        </Button>
        <Button onClick={handleSubmitClick} variant="contained">
          {mode === "add" ? "Thêm" : "Lưu"}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title="Xác nhận thoát"
        message="Bạn có chắc muốn thoát? Dữ liệu đang nhập sẽ không được lưu."
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />

      {mode === "edit" && (
        <ConfirmDialog
          open={openConfirmSave}
          title="Xác nhận lưu"
          message="Bạn có chắc muốn lưu các thay đổi?"
          onConfirm={handleConfirmSave}
          onCancel={() => setOpenConfirmSave(false)}
        />
      )}
    </Dialog>
  );
}

export default SubjectFormModel;
