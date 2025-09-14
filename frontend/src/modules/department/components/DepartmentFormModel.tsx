import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";

import "./styles/DepartmentFormModel.css"
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import dayjs from "dayjs";
import { STATUS } from "../../../constants/status";
import type { IDepartments } from "../types";

import { useCreateDepartment } from "../apis/addDepartment";

interface DepartmentFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: { name: string };
    onClose: () => void;
    onSubmit: (values: { name: string }) => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, mode, initialValues, onClose, onSubmit }) => {
    const [name, setName] = useState("");
    
    const [departmentCode, setDepartmentCode] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [establishedDate, setEstablishedDate] = useState<Date | null>(new Date()); 
    const [description, setDescription] = useState("");

    const { mutateAsync: createDepartment } = useCreateDepartment({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setName(initialValues.name);
        } else {
            setName("");
        }
    }, [mode, initialValues, open]);

    const handleSubmit = async () => {
        const payload: IDepartments = {
            department_code: departmentCode,
            name: departmentName,
            established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
            status: STATUS.ACTIVE,
            description: description
        }

        console.log(payload);

        await createDepartment(payload);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} className="primary-dialog department-form" maxWidth="sm" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? "ADD DEPARTMENT" : "Sửa Khoa"}
            </DialogTitle>
            <DialogContent className="primary-dialog-content">
                <LabelPrimary value="Mã Khoa" required></LabelPrimary>
                <TextField 
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)} 
                    fullWidth 
                    id="outlined-basic" 
                    variant="outlined" 
                    className="myprofile-text__field primary-dialog-input"/>

                <LabelPrimary value="Tên Khoa" required></LabelPrimary>
                <TextField 
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)} 
                    fullWidth 
                    id="outlined-basic" 
                    variant="outlined" 
                    className="myprofile-text__field primary-dialog-input"/>
                
                <LabelPrimary value="Ngày thành lập"></LabelPrimary>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={establishedDate ? new Date(establishedDate) : null} 
                        onChange={(newValue) => setEstablishedDate(newValue)}
                        className="myprofile-text__field primary-dialog-input"
                        slotProps={{ 
                            textField: { fullWidth: true }
                        }}
                    />
                </LocalizationProvider>

                <LabelPrimary value="Mô tả" />
                <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    id="department-description"
                    variant="outlined"
                    multiline
                    rows={3}   
                    className="myprofile-text__field"
                />
            </DialogContent>
            <DialogActions className="primary-dialog-actions">
                <Button onClick={onClose} className="button-cancel">Hủy</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {mode === "add" ? "Thêm" : "Lưu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DepartmentForm;