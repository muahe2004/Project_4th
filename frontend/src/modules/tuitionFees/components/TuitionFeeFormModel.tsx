import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import LabelPrimary from "../../../components/Label/Label";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { STATUS } from "../../../constants/status";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { hasObjectChanged } from "../../../utils/checkChangeValues";
import { useTrainingProgramsDropDown } from "../../training_program/apis/getTrainingProgramsDropDown";
import { useTrainingProgramsDropDownByIds } from "../../training_program/apis/getTrainingProgramsDropDownByIds";
import { useCreateTuitionFee } from "../apis/addTuitionFee";
import { useUpdateTuitionFee } from "../apis/updateTuitionFee";
import type {
  ITuitionFee,
  TuitionFeeCreatePayload,
  TuitionFeeUpdatePayload,
} from "../types";

interface TuitionFeeFormModelProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: ITuitionFee;
  onClose: () => void;
}

const getAcademicYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => {
    const startYear = currentYear + index;
    return `${startYear} - ${startYear + 1}`;
  });
};

const ACADEMIC_YEAR_OPTIONS = getAcademicYearOptions();

export function TuitionFeeFormModel({
  open,
  mode,
  initialValues,
  onClose,
}: TuitionFeeFormModelProps) {
  const id = initialValues?.id;
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [pricePerCredit, setPricePerCredit] = useState("");
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [searchTrainingProgram, setSearchTrainingProgram] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState(STATUS.ACTIVE);
  const [openConfirmSave, setOpenConfirmSave] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<
    TuitionFeeCreatePayload | TuitionFeeUpdatePayload | null
  >(null);

  const trainingProgramParams = {
    limit: 20,
    skip: 0,
    status: STATUS.ACTIVE,
    search: searchTrainingProgram || undefined,
  };

  const { data: trainingPrograms = [] } = useTrainingProgramsDropDown(trainingProgramParams);
  const { data: selectedTrainingPrograms = [] } = useTrainingProgramsDropDownByIds(
    trainingProgramId ? { ids: [trainingProgramId] } : { ids: [] }
  );
  const { mutateAsync: createTuitionFee } = useCreateTuitionFee();
  const { mutateAsync: updateTuitionFee } = useUpdateTuitionFee();

  const trainingProgramOptions = useMemo(() => {
    const merged = [...selectedTrainingPrograms, ...trainingPrograms];
    return Array.from(new Map(merged.map((item) => [item.id, item])).values());
  }, [selectedTrainingPrograms, trainingPrograms]);

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setName(initialValues.name || "");
      setAcademicYear(initialValues.academic_year || "");
      setPricePerCredit(String(initialValues.price_per_credit ?? ""));
      setTrainingProgramId(initialValues.training_program_id || "");
      setStartDate(initialValues.start_date ? new Date(initialValues.start_date) : null);
      setEndDate(initialValues.end_date ? new Date(initialValues.end_date) : null);
      setStatus(initialValues.status || STATUS.ACTIVE);
    } else {
      setName("");
      setAcademicYear("");
      setPricePerCredit("");
      setTrainingProgramId("");
      setStartDate(null);
      setEndDate(null);
      setStatus(STATUS.ACTIVE);
    }
    setIsChanged(false);
  }, [mode, initialValues, open]);

  const currentValues: TuitionFeeCreatePayload = {
    name: name.trim() || null,
    academic_year: academicYear.trim(),
    price_per_credit: Number(pricePerCredit),
    training_program_id: trainingProgramId.trim(),
    status,
    type: initialValues?.type ?? null,
    start_date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
    end_date: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
  };

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      const payload = {
        name: name.trim() || null,
        academic_year: academicYear.trim(),
        price_per_credit: Number(pricePerCredit),
        training_program_id: trainingProgramId.trim(),
        status,
        type: initialValues.type ?? null,
        start_date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
        end_date: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
      };

      const hasChanges = hasObjectChanged(
        payload,
        {
          name: initialValues.name || null,
          academic_year: initialValues.academic_year,
          price_per_credit: initialValues.price_per_credit,
          training_program_id: initialValues.training_program_id,
          status: initialValues.status || STATUS.ACTIVE,
          type: initialValues.type || null,
          start_date: initialValues.start_date || null,
          end_date: initialValues.end_date || null,
        },
        ["start_date", "end_date"],
        []
      );

      setIsChanged(hasChanges);
      return;
    }

    const hasInput =
      name.trim() !== "" ||
      academicYear.trim() !== "" ||
      pricePerCredit.trim() !== "" ||
      trainingProgramId.trim() !== "";
    setIsChanged(hasInput);
  }, [mode, initialValues, name, academicYear, pricePerCredit, trainingProgramId, status]);

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    isChanged,
    onClose,
  });

  const validateForm = (): boolean => {
    if (!academicYear.trim()) {
      showSnackbar("Niên khoá là bắt buộc", "error");
      return false;
    }
    if (!pricePerCredit.trim() || Number.isNaN(Number(pricePerCredit)) || Number(pricePerCredit) < 0) {
      showSnackbar("Giá / tín chỉ không hợp lệ", "error");
      return false;
    }
    if (!trainingProgramId.trim()) {
      showSnackbar("CTĐT là bắt buộc", "error");
      return false;
    }
    return true;
  };

  const handleSubmitClick = () => {
    if (!validateForm()) {
      return;
    }

    if (mode === "edit" && initialValues) {
      if (!isChanged) {
        return;
      }

      setPendingPayload({
        ...currentValues,
        updated_at: dayjs().toISOString(),
      });
      setOpenConfirmSave(true);
      return;
    }

    console.log("Tuition fee add payload:", currentValues);
    setPendingPayload(currentValues);
    void handleConfirmSave(currentValues);
  };

  const handleConfirmSave = async (
    payload: TuitionFeeCreatePayload | TuitionFeeUpdatePayload
  ) => {
    try {
      if (mode === "add") {
        await createTuitionFee(payload as TuitionFeeCreatePayload);
        await queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });
        showSnackbar("Thêm học phí thành công!", "success");
      } else if (mode === "edit" && id) {
        await updateTuitionFee({ id, data: payload as TuitionFeeUpdatePayload });
        await queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });
        showSnackbar("Cập nhật học phí thành công!", "success");
      }

      setOpenConfirmSave(false);
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
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
        {mode === "add" ? "ADD TUITION FEE" : "EDIT TUITION FEE"}
      </DialogTitle>

      <DialogContent className="primary-dialog-content">
        <LabelPrimary value="Tên học phí" />
        <TextField
          value={name}
          onChange={(event) => setName(event.target.value)}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        

        <LabelPrimary value="Giá / tín chỉ" required />
        <TextField
          value={pricePerCredit}
          onChange={(event) => setPricePerCredit(event.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value="CTĐT" required />
        <MainAutocomplete
          options={trainingProgramOptions}
          value={trainingProgramId}
          onChange={setTrainingProgramId}
          onSearchChange={setSearchTrainingProgram}
          getOptionLabel={(option: any) =>
            `${option.training_program_name || option.program_type || "CTĐT"} (${option.academic_year})`
          }
          getOptionId={(option: any) => option.id}
          placeholder="Chọn CTĐT"
        />

        <LabelPrimary value="Ngày bắt đầu" />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            className="main-text__field primary-dialog-input"
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>

        <LabelPrimary value="Ngày kết thúc" />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            className="main-text__field primary-dialog-input"
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>

        <LabelPrimary value="Niên khoá" required />
        <Select
          value={academicYear}
          onChange={(event) => setAcademicYear(String(event.target.value))}
          fullWidth
          displayEmpty
          className="main-text__field primary-dialog-input"
          renderValue={(value) => value || "Chọn niên khoá"}
        >
          {ACADEMIC_YEAR_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          Hủy
        </Button>
        <Button onClick={handleSubmitClick} variant="contained" disabled={!isChanged}>
          {mode === "add" ? "Thêm" : "Lưu"}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title="Xác nhận thoát"
        message="Bạn có chắc muốn thoát? Dữ liệu đang nhập sẽ không được lưu."
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />

      <ConfirmDialog
        open={openConfirmSave}
        title="Xác nhận lưu"
        message="Bạn có chắc muốn lưu các thay đổi?"
        onConfirm={() => {
          if (pendingPayload) {
            void handleConfirmSave(pendingPayload);
          }
        }}
        onCancel={() => setOpenConfirmSave(false)}
      />
    </Dialog>
  );
}

export default TuitionFeeFormModel;
