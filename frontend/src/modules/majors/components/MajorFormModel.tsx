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

interface DepartmentFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IDepartments;
    onClose: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, mode, initialValues, onClose }) => {
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

        // Có thay đổi hoặc thêm mới → hỏi xác nhận lưu
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

            showSnackbar(mode === "add" ? "Thêm khoa thành công!" : "Cập nhật khoa thành công!", "success");
            setOpenConfirmSave(false);
            onClose();
        } catch (error: any) {
            console.error(error);
            showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseClick} className="primary-dialog department-form" maxWidth="sm" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? "ADD DEPARTMENT" : "Sửa Khoa"}
            </DialogTitle>
            <DialogContent className="primary-dialog-content">
                <LabelPrimary value="Mã Khoa" required />
                <TextField
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="myprofile-text__field primary-dialog-input"
                />

                <LabelPrimary value="Tên Khoa" required />
                <TextField
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="myprofile-text__field primary-dialog-input"
                />

                <LabelPrimary value="Ngày thành lập" />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={establishedDate ? new Date(establishedDate) : null}
                        onChange={(newValue) => setEstablishedDate(newValue)}
                        className="myprofile-text__field primary-dialog-input"
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </LocalizationProvider>

                <LabelPrimary value="Mô tả" />
                <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    className="myprofile-text__field"
                />
            </DialogContent>
            <DialogActions className="primary-dialog-actions">
                <Button onClick={handleCloseClick} className="button-cancel">Hủy</Button>
                <Button onClick={handleSubmitClick} variant="contained">
                    {mode === "add" ? "Thêm" : "Lưu"}
                </Button>
            </DialogActions>

            {/* Confirm thoát nếu không thay đổi */}
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

            {/* Confirm lưu nếu có thay đổi */}
            <ConfirmDialog
                open={openConfirmSave}
                title="Xác nhận lưu"
                message="Bạn có chắc muốn lưu các thay đổi?"
                onConfirm={handleConfirmSave}
                onCancel={() => setOpenConfirmSave(false)}
            />
        </Dialog>
    );
};

export default DepartmentForm;
