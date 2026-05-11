import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography
} from "@mui/material";
import { useTranslation } from "react-i18next";
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

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel, confirmLabel, cancelLabel, }) => {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t("common.confirm", "Xác nhận");
    const resolvedConfirmLabel = confirmLabel ?? t("common.agree", "Đồng ý");
    const resolvedCancelLabel = cancelLabel ?? t("common.cancel", "Hủy");

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
        <DialogTitle>{resolvedTitle}</DialogTitle>
        <DialogContent>
            <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} className="button-cancel">{resolvedCancelLabel}</Button>
            <Button onClick={onConfirm} variant="contained">{resolvedConfirmLabel}</Button>
        </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
