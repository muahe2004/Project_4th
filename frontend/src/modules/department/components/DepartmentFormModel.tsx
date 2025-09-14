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
import { useEditDepartment } from "../apis/editDepartment";

interface DepartmentFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IDepartments;
    onClose: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, mode, initialValues, onClose }) => {    
    const ID = initialValues?.id;

    const [departmentCode, setDepartmentCode] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [establishedDate, setEstablishedDate] = useState<Date | null>(new Date()); 
    const [description, setDescription] = useState("");

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

    const handleSubmit = async () => {
        if (mode === "add") {
            const payload: IDepartments = {
                department_code: departmentCode,
                name: departmentName,
                established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
                status: STATUS.ACTIVE,
                description: description
            }

            await createDepartment(payload);
            onClose();
        } else if (mode === "edit") {
            const payload: IDepartments = {
                department_code: departmentCode,
                name: departmentName,
                established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
                status: STATUS.ACTIVE,
                description: description,
                updated_at: dayjs().format("YYYY-MM-DD")
            }
            await editDepartment({ id: ID as string, data: payload})
        } else {
            console.error("Unknown");
        }
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