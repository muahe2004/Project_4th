import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography
} from "@mui/material";
import Button from "../Button/Button"; 

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title = "Xác nhận", message, onConfirm, onCancel, confirmLabel = "Đồng ý", cancelLabel = "Hủy", }) => {
    return (
        <Dialog
            sx={{
                "& .MuiDialog-container": {
                alignItems: "flex-start", 
                justifyContent: "center", 
                },
                "& .MuiPaper-root": {
                marginTop: "80px", 
                },
            }}
            open={open} onClose={onCancel} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} className="button-cancel">{cancelLabel}</Button>
            <Button onClick={onConfirm} variant="contained">{confirmLabel}</Button>
        </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
