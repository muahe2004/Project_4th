import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

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
import { useDepartmentsDropDown } from "../../department/apis/getDepartmentsDropDown";
import type { IDepartmentsDropDown } from "../../department/types";
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

const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  return `${currentYear} - ${currentYear + 1}`;
};

export function TuitionFeeFormModel({
  open,
  mode,
  initialValues,
  onClose,
}: TuitionFeeFormModelProps) {
  const { t } = useTranslation();
  const id = initialValues?.id;
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [pricePerCredit, setPricePerCredit] = useState("");
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
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
  const departmentParams = {
    limit: 20,
    skip: 0,
    status: STATUS.ACTIVE,
    search: searchDepartment || undefined,
  };

  const { data: trainingPrograms = [] } = useTrainingProgramsDropDown(trainingProgramParams);
  const { data: selectedTrainingPrograms = [] } = useTrainingProgramsDropDownByIds(
    trainingProgramId ? { ids: [trainingProgramId] } : { ids: [] }
  );
  const { data: departments = [] } = useDepartmentsDropDown(departmentParams);
  const { mutateAsync: createTuitionFee } = useCreateTuitionFee();
  const { mutateAsync: updateTuitionFee } = useUpdateTuitionFee();

  const trainingProgramOptions = useMemo(() => {
    const merged = [...selectedTrainingPrograms, ...trainingPrograms];
    return Array.from(new Map(merged.map((item) => [item.id, item])).values());
  }, [selectedTrainingPrograms, trainingPrograms]);

  const departmentOptions = departments;

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setName(initialValues.name || "");
      setPricePerCredit(String(initialValues.price_per_credit ?? ""));
      setTrainingProgramId(initialValues.training_program_id || "");
      setDepartmentId(initialValues.department_info?.id || "");
      setStartDate(initialValues.start_date ? new Date(initialValues.start_date) : null);
      setEndDate(initialValues.end_date ? new Date(initialValues.end_date) : null);
      setStatus(initialValues.status || STATUS.ACTIVE);
    } else {
      setName("");
      setPricePerCredit("");
      setTrainingProgramId("");
      setDepartmentId("");
      setStartDate(null);
      setEndDate(null);
      setStatus(STATUS.ACTIVE);
    }
    setIsChanged(false);
  }, [mode, initialValues, open]);

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      const payload = {
        name: name.trim() || null,
        price_per_credit: Number(pricePerCredit),
        status,
        type: initialValues.type ?? null,
        start_date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
        end_date: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
      };

      const hasChanges = hasObjectChanged(
        payload,
        {
          name: initialValues.name || null,
          price_per_credit: initialValues.price_per_credit,
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
      pricePerCredit.trim() !== "" ||
      departmentId.trim() !== "";
    setIsChanged(hasInput);
  }, [mode, initialValues, name, pricePerCredit, departmentId, status]);

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    isChanged,
    onClose,
  });

  const validateForm = (): boolean => {
    if (!pricePerCredit.trim() || Number.isNaN(Number(pricePerCredit)) || Number(pricePerCredit) < 0) {
      showSnackbar(t("tuitionFees.form.errors.pricePerCredit"), "error");
      return false;
    }
    if (mode === "add" && !departmentId.trim()) {
      showSnackbar(t("tuitionFees.form.errors.departmentRequired"), "error");
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
        name: name.trim() || null,
        price_per_credit: Number(pricePerCredit),
        status,
        type: initialValues?.type ?? null,
        start_date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
        end_date: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
        updated_at: dayjs().toISOString(),
      });
      setOpenConfirmSave(true);
      return;
    }

    const addPayload: TuitionFeeCreatePayload = {
      name: name.trim() || null,
      academic_year: getCurrentAcademicYear(),
      price_per_credit: Number(pricePerCredit),
      department_id: departmentId.trim(),
      status,
      type: initialValues?.type ?? null,
      start_date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
      end_date: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
    };
    setPendingPayload(addPayload);
    void handleConfirmSave(addPayload);
  };

  const handleConfirmSave = async (
    payload: TuitionFeeCreatePayload | TuitionFeeUpdatePayload
  ) => {
    try {
      if (mode === "add") {
        await createTuitionFee(payload as TuitionFeeCreatePayload);
        await queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });
        showSnackbar(t("tuitionFees.messages.addSuccess"), "success");
      } else if (mode === "edit" && id) {
        await updateTuitionFee({ id, data: payload as TuitionFeeUpdatePayload });
        await queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });
        showSnackbar(t("tuitionFees.messages.updateSuccess"), "success");
      }

      setOpenConfirmSave(false);
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar(t("tuitionFees.messages.genericError"), "error");
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
        {mode === "add" ? t("tuitionFees.form.titleAdd") : t("tuitionFees.form.titleEdit")}
      </DialogTitle>

      <DialogContent className="primary-dialog-content">
        <LabelPrimary value={t("tuitionFees.form.labels.name")} />
        <TextField
          value={name}
          onChange={(event) => setName(event.target.value)}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        

        <LabelPrimary value={t("tuitionFees.form.labels.pricePerCredit")} required />
        <TextField
          value={pricePerCredit}
          onChange={(event) => setPricePerCredit(event.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          className="main-text__field primary-dialog-input"
        />

        {mode === "add" ? (
          <>
            <LabelPrimary value={t("tuitionFees.form.labels.department")} required />
            <MainAutocomplete
              options={departmentOptions}
              value={departmentId}
              onChange={setDepartmentId}
              onSearchChange={setSearchDepartment}
              getOptionLabel={(option: IDepartmentsDropDown) =>
                `${option.department_code} - ${option.department_name}`
              }
              getOptionId={(option: IDepartmentsDropDown) => option.id}
              placeholder={t("tuitionFees.form.placeholders.department")}
            />
          </>
        ) : (
          <>
            <LabelPrimary value={t("tuitionFees.form.labels.trainingProgram")} />
            <MainAutocomplete
              options={trainingProgramOptions}
              value={trainingProgramId}
              onChange={setTrainingProgramId}
              onSearchChange={setSearchTrainingProgram}
              getOptionLabel={(option: any) =>
                `${option.training_program_name || option.program_type || "CTĐT"} (${option.academic_year})`
              }
              getOptionId={(option: any) => option.id}
              placeholder={t("tuitionFees.form.placeholders.trainingProgram")}
            />
          </>
        )}

        <LabelPrimary value={t("tuitionFees.form.labels.startDate")} />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            className="main-text__field primary-dialog-input"
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>

        <LabelPrimary value={t("tuitionFees.form.labels.endDate")} />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            className="main-text__field primary-dialog-input"
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>

      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmitClick} variant="contained" disabled={!isChanged}>
          {mode === "add" ? t("common.add") : t("common.save")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title={t("common.confirmExitTitle")}
        message={t("tuitionFees.form.confirmExit")}
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />

      <ConfirmDialog
        open={openConfirmSave}
        title={t("tuitionFees.form.confirmSaveTitle")}
        message={t("tuitionFees.form.confirmSave")}
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
