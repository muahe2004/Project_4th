import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";

interface DepartmentFormProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: { name: string };
  onClose: () => void;
  onSubmit: (values: { name: string }) => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ 
  open, 
  mode, 
  initialValues, 
  onClose, 
  onSubmit 
}) => {
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {mode === "add" ? "Thêm Khoa" : "Sửa Khoa"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Tên Khoa"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === "add" ? "Thêm" : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentForm;
