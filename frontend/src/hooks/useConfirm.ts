import { useState } from "react";

interface UseConfirmCloseFormProps {
  mode: "add" | "edit";
  isChanged: boolean; 
  onClose: () => void;
}

export const useConfirmCloseForm = ({mode, isChanged, onClose}: UseConfirmCloseFormProps) => {
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