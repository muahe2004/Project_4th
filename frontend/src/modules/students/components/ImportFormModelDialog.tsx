import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { IStudentFileData } from "../types";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";

interface ImportFormModelDialogProps {
    open: boolean;
    onClose: () => void;
    initialStudent: IStudentFileData | null;
    onSave: (student: IStudentFileData) => void;
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
    initialStudent,
    onSave,
}: ImportFormModelDialogProps) => {
    const [student, setStudent] = useState<IStudentFileData>({
        student_code: null,
        name: null,
        gender: null,
        date_of_birth: null,
        email: null,
        phone: null,
        address: null,
        class_id: null,
        class_code: null,
        class_name: null,
    });
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        const defaultStudent: IStudentFileData = {
            student_code: null,
            name: null,
            gender: null,
            date_of_birth: null,
            email: null,
            phone: null,
            address: null,
            class_id: null,
            class_code: null,
            class_name: null,
        };

        const nextStudent = initialStudent ?? defaultStudent;
        setStudent(nextStudent);
        setDateOfBirth(nextStudent.date_of_birth ? new Date(nextStudent.date_of_birth) : null);
    }, [open, initialStudent]);

    const setField = (field: keyof IStudentFileData, value: string) => {
        const nextValue = field === "date_of_birth"
            ? (value ? `${value}T00:00:00` : null)
            : (value || null);

        setStudent((prev) => ({
            ...prev,
            [field]: nextValue,
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle className="primary-dialog-title">Chỉnh sửa sinh viên import</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} className="myprofile-form">
                    <Grid size={6}>
                        <LabelPrimary value="Mã sinh viên" required />
                        <TextField
                            value={student.student_code || ""}
                            onChange={(event) => setField("student_code", event.target.value)}
                            fullWidth
                            variant="outlined"
                            className="main-text__field"
                        />
                    </Grid>
                    <Grid size={6}>
                        <LabelPrimary value="Họ và tên" required />
                        <TextField
                            value={student.name || ""}
                            onChange={(event) => setField("name", event.target.value)}
                            fullWidth
                            variant="outlined"
                            className="main-text__field"
                        />
                    </Grid>
                    <Grid size={6}>
                        <LabelPrimary value="Giới tính" />
                        <Select
                            value={student.gender || "3"}
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
                        <LabelPrimary value="Email" />
                        <TextField
                            value={student.email || ""}
                            onChange={(event) => setField("email", event.target.value)}
                            fullWidth
                            variant="outlined"
                            className="main-text__field"
                        />
                    </Grid>
                    <Grid size={6}>
                        <LabelPrimary value="Số điện thoại" />
                        <TextField
                            value={student.phone || ""}
                            onChange={(event) => setField("phone", event.target.value)}
                            fullWidth
                            variant="outlined"
                            className="main-text__field"
                        />
                    </Grid>
                    <Grid size={6}>
                        <LabelPrimary value="Mã lớp" />
                        <TextField
                            value={student.class_code || ""}
                            onChange={(event) => setField("class_code", event.target.value)}
                            fullWidth
                            variant="outlined"
                            className="main-text__field"
                        />
                    </Grid>
                    <Grid size={12}>
                        <LabelPrimary value="Địa chỉ" />
                        <TextField
                            value={student.address || ""}
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
                <Button onClick={() => onSave(student)}>Lưu</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportFormModelDialog;
