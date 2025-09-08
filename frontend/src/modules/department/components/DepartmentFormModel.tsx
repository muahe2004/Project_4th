import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";

import "./styles/DepartmentFormModel.css"
import LabelPrimary from "../../../components/Label/Label";

interface DepartmentFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: { name: string };
    onClose: () => void;
    onSubmit: (values: { name: string }) => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, mode, initialValues, onClose, onSubmit }) => {
    const [name, setName] = useState("");

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setName(initialValues.name);
        } else {
            setName("");
        }
    }, [mode, initialValues, open]);

    const handleSubmit = () => {
        onSubmit({ name });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} className="primary-dialog department-form" maxWidth="sm" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? "ADD DEPARTMENT" : "Sửa Khoa"}
            </DialogTitle>
            <DialogContent className="primary-dialog-content">
                <LabelPrimary value="Mã Khoa"></LabelPrimary>
                <TextField 
                    // value={ethnicity}
                    // onChange={(e) => setEthnicity(e.target.value)} 
                    fullWidth 
                    id="outlined-basic" 
                    variant="outlined" 
                    className="myprofile-text__field primary-dialog-input"/>

                <LabelPrimary value="Tên Khoa"></LabelPrimary>
                <TextField 
                    // value={ethnicity}
                    // onChange={(e) => setEthnicity(e.target.value)} 
                    fullWidth 
                    id="outlined-basic" 
                    variant="outlined" 
                    className="myprofile-text__field primary-dialog-input"/>
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
