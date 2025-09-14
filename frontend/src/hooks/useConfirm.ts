// hooks/useConfirmCloseForm.ts
import { useState } from "react";
import dayjs from "dayjs";

interface UseConfirmCloseFormProps {
  mode: "add" | "edit";
  initialValues?: Record<string, any>;
  currentValues: Record<string, any>;
  onClose: () => void;
}

export const useConfirmCloseForm = ({
  mode,
  initialValues,
  currentValues,
  onClose,
}: UseConfirmCloseFormProps) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  // Helper so sánh hai giá trị
  const isEqual = (a: any, b: any) => {
    if (a instanceof Date && b) return dayjs(a).isSame(dayjs(b), "day");
    if (a === undefined && b === undefined) return true;
    return a === b;
  };

  const handleCloseClick = () => {
    // Nếu add mà form rỗng → đóng luôn
    if (mode === "add") {
      const isEmpty = Object.values(currentValues).every((v) => {
        if (v instanceof Date) return dayjs(v).isSame(dayjs(), "day");
        return !v;
      });
      if (isEmpty) {
        onClose();
        return;
      }
    }

    // Kiểm tra thay đổi
    const hasChanges = Object.keys(currentValues).some((key) => {
      return !isEqual(currentValues[key], initialValues?.[key]);
    });

    if (hasChanges) setOpenConfirm(true);
    else onClose();
  };

  return { openConfirm, setOpenConfirm, handleCloseClick };
};
