import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";

import "./styles/DepartmentFormModel.css"

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
        <Dialog open={open} onClose={onClose} className="department-form" maxWidth="sm" fullWidth>
            <DialogTitle className="form-model-title">
                {mode === "add" ? "THÊM KHOA" : "Sửa Khoa"}
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Mã khoa"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // className="myprofile-text__field"
                />

                <TextField
                    autoFocus
                    margin="dense"
                    label="Tên Khoa"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // className="myprofile-text__field"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} className="button-cancel">Hủy</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {mode === "add" ? "Thêm" : "Lưu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DepartmentForm;
