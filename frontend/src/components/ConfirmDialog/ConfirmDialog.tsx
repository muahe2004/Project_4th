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
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title = "Xác nhận", message, onConfirm, onCancel, }) => {
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
            <Button onClick={onCancel} className="button-cancel">Hủy</Button>
            <Button onClick={onConfirm} variant="contained">Đồng ý</Button>
        </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;