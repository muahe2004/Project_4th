import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import dayjs from "dayjs";
import { STATUS } from "../../../constants/status";
import type { IDepartments } from "../types";
import { useCreateDepartment } from "../apis/addDepartment";
import { useEditDepartment } from "../apis/editDepartment";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { useTranslation } from "react-i18next";

interface DepartmentFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IDepartments;
    onClose: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, mode, initialValues, onClose }) => {
    const { t } = useTranslation();
    const ID = initialValues?.id;
    const { showSnackbar } = useSnackbar();

    const [departmentCode, setDepartmentCode] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [establishedDate, setEstablishedDate] = useState<Date | null>(new Date());
    const [description, setDescription] = useState("");

    const [openConfirmSave, setOpenConfirmSave] = useState(false);

    const { mutateAsync: createDepartment } = useCreateDepartment({});
    const { mutateAsync: editDepartment } = useEditDepartment({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setDepartmentCode(initialValues.department_code || "");
            setDepartmentName(initialValues.name || "");
            setEstablishedDate(
                initialValues.established_date
                ? new Date(initialValues.established_date)
                : null
            );
            setDescription(initialValues.description || "");
        } else {
            setDepartmentCode("");
            setDepartmentName("");
            setEstablishedDate(new Date());
            setDescription("");
        }
    }, [mode, initialValues, open]);

    const currentValues = {
        department_code: departmentCode,
        name: departmentName,
        established_date: establishedDate,
        description,
    };

    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
        mode,
        initialValues,
        currentValues,
        onClose,
    });

    const handleSubmitClick = () => {
        if (mode === "add") {
            void handleConfirmSave();
            return;
        }

        const payload: IDepartments = {
            department_code: departmentCode,
            name: departmentName,
            established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
            status: STATUS.ACTIVE,
            description,
            updated_at: dayjs().format("YYYY-MM-DD"),
        };

        const hasChanges = Object.keys(payload).some(
            key => payload[key as keyof IDepartments] !== initialValues?.[key as keyof IDepartments]
        );

        if (mode === "edit" && !hasChanges) {
            // Không có thay đổi → hỏi thoát
            setOpenConfirm(true);
            return;
        }

        // Edit có thay đổi → hỏi xác nhận lưu
        setOpenConfirmSave(true);
    };

    const handleConfirmSave = async () => {
        try {
            const payload: IDepartments = {
                department_code: departmentCode,
                name: departmentName,
                established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
                status: STATUS.ACTIVE,
                description,
                updated_at: dayjs().format("YYYY-MM-DD"),
            };

            if (mode === "add") await createDepartment(payload);
            else if (mode === "edit") await editDepartment({ id: ID as string, data: payload });

            showSnackbar(
                mode === "add"
                    ? t("departments.messages.addSuccess")
                    : t("departments.messages.updateSuccess"),
                "success"
            );
            setOpenConfirmSave(false);
            onClose();
        } catch (error: any) {
            console.error(error);
            showSnackbar(t("departments.messages.genericError"), "error");
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseClick} className="primary-dialog department-form" maxWidth="sm" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? t("departments.form.titleAdd") : t("departments.form.titleEdit")}
            </DialogTitle>
            <DialogContent className="primary-dialog-content">
                <LabelPrimary value={t("departments.form.labels.departmentCode")} required />
                <TextField
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                />

                <LabelPrimary value={t("departments.form.labels.departmentName")} required />
                <TextField
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                />

                <LabelPrimary value={t("departments.form.labels.establishedDate")} />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={establishedDate ? new Date(establishedDate) : null}
                        onChange={(newValue) => setEstablishedDate(newValue)}
                        className="main-text__field primary-dialog-input"
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </LocalizationProvider>

                <LabelPrimary value={t("departments.form.labels.description")} />
                <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    className="main-text__field"
                />
            </DialogContent>
            <DialogActions className="primary-dialog-actions">
                <Button onClick={handleCloseClick} className="button-cancel">
                    {t("departments.common.cancel")}
                </Button>
                <Button onClick={handleSubmitClick} variant="contained">
                    {mode === "add" ? t("departments.common.add") : t("departments.common.save")}
                </Button>
            </DialogActions>

            {/* Confirm thoát nếu không thay đổi */}
            <ConfirmDialog
                open={openConfirm}
                title={t("departments.confirm.exitTitle")}
                message={t("departments.confirm.exitMessage")}
                onConfirm={() => {
                    setOpenConfirm(false);
                    onClose();
                }}
                onCancel={() => setOpenConfirm(false)}
            />

            {/* Confirm lưu chỉ dùng cho mode edit */}
            {mode === "edit" && (
                <ConfirmDialog
                    open={openConfirmSave}
                    title={t("departments.confirm.saveTitle")}
                    message={t("departments.confirm.saveMessage")}
                    onConfirm={handleConfirmSave}
                    onCancel={() => setOpenConfirmSave(false)}
                />
            )}
        </Dialog>
    );
};

export default DepartmentForm;
