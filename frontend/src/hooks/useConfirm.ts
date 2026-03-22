import { useState } from "react";

interface UseConfirmCloseFormProps {
  mode: "add" | "edit";
  isChanged?: boolean;
  initialValues?: unknown;
  currentValues?: unknown;
  onClose: () => void;
}

export const useConfirmCloseForm = ({
  mode,
  isChanged = false,
  onClose,
}: UseConfirmCloseFormProps) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleCloseClick = () => {
    if (mode === "add" && !isChanged) {
      onClose();
      return;
    }

    if (isChanged) setOpenConfirm(true);
    else onClose();
  };

  return { openConfirm, setOpenConfirm, handleCloseClick };
};
