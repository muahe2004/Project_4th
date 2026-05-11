import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import LabelPrimary from "../../../components/Label/Label";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { STATUS } from "../../../constants/status";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { hasObjectChanged } from "../../../utils/checkChangeValues";
import { useCreateRoom } from "../apis/addRoom";
import { useUpdateRoom } from "../apis/updateRoom";
import type { IRoom, RoomCreatePayload, RoomUpdatePayload } from "../types";

interface RoomFormModelProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: IRoom;
  onClose: () => void;
}

export function RoomFormModel({
  open,
  mode,
  initialValues,
  onClose,
}: RoomFormModelProps) {
  const { t } = useTranslation();
  const roomId = initialValues?.id;
  const { showSnackbar } = useSnackbar();

  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("");
  const [seats, setSeats] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [openConfirmSave, setOpenConfirmSave] = useState(false);

  const { mutateAsync: createRoom } = useCreateRoom({});
  const { mutateAsync: updateRoom } = useUpdateRoom();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setRoomNumber(String(initialValues.room_number || ""));
      setRoomType(initialValues.type || "");
      setSeats(String(initialValues.seats || ""));
    } else {
      setRoomNumber("");
      setRoomType("");
      setSeats("");
    }
    setIsChanged(false);
  }, [mode, initialValues, open]);

  const currentValues = {
    room_number: Number(roomNumber),
    type: roomType.trim(),
    seats: Number(seats),
  };

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setIsChanged(
        hasObjectChanged(
          currentValues,
          {
            room_number: initialValues.room_number,
            type: initialValues.type,
            seats: initialValues.seats,
          },
          [],
          []
        )
      );
      return;
    }

    const hasInput =
      roomNumber.trim() !== "" || currentValues.type !== "" || seats.trim() !== "";
    setIsChanged(hasInput);
  }, [mode, initialValues, roomNumber, roomType, seats]);

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    isChanged,
    onClose,
  });

  const validateForm = (): boolean => {
    const roomNumberValue = Number(roomNumber);
    if (!Number.isInteger(roomNumberValue) || roomNumberValue <= 0) {
      showSnackbar(t("rooms.form.errors.roomNumber"), "error");
      return false;
    }
    if (!roomType.trim()) {
      showSnackbar(t("rooms.form.errors.roomType"), "error");
      return false;
    }
    const seatsValue = Number(seats);
    if (!Number.isInteger(seatsValue) || seatsValue <= 0) {
      showSnackbar(t("rooms.form.errors.seats"), "error");
      return false;
    }
    return true;
  };

  const handleSubmitClick = () => {
    if (!validateForm()) {
      return;
    }

    if (mode === "add") {
      void handleConfirmSave();
      return;
    }

    if (mode === "edit" && !isChanged) {
      setOpenConfirm(true);
      return;
    }

    setOpenConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const basePayload = {
        room_number: Number(roomNumber),
        type: roomType.trim(),
        seats: Number(seats),
        status: initialValues?.status ?? STATUS.ACTIVE,
      };

      if (mode === "add") {
        const payload: RoomCreatePayload = {
          ...basePayload,
          status: STATUS.ACTIVE,
        };
        await createRoom(payload);
      } else if (mode === "edit" && roomId) {
        const payload: RoomUpdatePayload = {
          ...basePayload,
          updated_at: dayjs().format("YYYY-MM-DD"),
        };
        await updateRoom({ id: roomId, data: payload });
      }

      showSnackbar(
        mode === "add" ? t("rooms.messages.addSuccess") : t("rooms.messages.updateSuccess"),
        "success"
      );
      setOpenConfirmSave(false);
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar(t("rooms.messages.genericError"), "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseClick}
      className="primary-dialog department-form"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="primary-dialog-title">
        {mode === "add" ? t("rooms.form.titleAdd") : t("rooms.form.titleEdit")}
      </DialogTitle>

      <DialogContent className="primary-dialog-content">
        <LabelPrimary value={t("rooms.form.labels.roomNumber")} required />
        <TextField
          value={roomNumber}
          onChange={(event) => setRoomNumber(event.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value={t("rooms.form.labels.roomType")} required />
        <TextField
          value={roomType}
          onChange={(event) => setRoomType(event.target.value)}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value={t("rooms.form.labels.seats")} required />
        <TextField
          value={seats}
          onChange={(event) => setSeats(event.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          className="main-text__field primary-dialog-input"
        />
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmitClick} variant="contained">
          {mode === "add" ? t("common.add") : t("common.save")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title={t("common.confirmExitTitle")}
        message={t("rooms.form.confirmExit")}
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />

      {mode === "edit" && (
        <ConfirmDialog
          open={openConfirmSave}
          title={t("rooms.form.confirmSaveTitle")}
          message={t("rooms.form.confirmSave")}
          onConfirm={handleConfirmSave}
          onCancel={() => setOpenConfirmSave(false)}
        />
      )}
    </Dialog>
  );
}

export default RoomFormModel;
