import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import LabelPrimary from "../../../components/Label/Label";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { STATUS } from "../../../constants/status";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { isRequired } from "../../../utils/validation/validations";
import { useClassesDropDown } from "../../classes/apis/getClassDropDown";
import { useClassesDropDownByIds } from "../../classes/apis/getClassDropDownByIds";
import { useRoomDropDown } from "../../teachingSchedule/apis/getRoomDropDown";
import { useRoomDropDownByIds } from "../../teachingSchedule/apis/getRoomDropDownByIds";
import { useSubjectDropDown } from "../../teachingSchedule/apis/getSubjectDropDown";
import { useSubjectDropDownByIds } from "../../teachingSchedule/apis/getSubjectDropDownByIds";
import { useTeacherDropdown } from "../../teachers/apis/getTeacherDropDown";
import { useTeacherDropdownByIds } from "../../teachers/apis/getTeacherDropDownByIds";
import { useCreateExaminationSchedule } from "../apis/addExaminationSchedule";
import { useUpdateExaminationSchedule } from "../apis/updateExaminationSchedule";
import { useTranslation } from "react-i18next";
import type {
  IExaminationScheduleCreatePayload,
  IExaminationScheduleResponse,
  IExaminationScheduleUpdatePayload,
} from "../types";

type ExaminationScheduleFormMode = "add" | "edit";

interface ExaminationScheduleFormModelProps {
  open: boolean;
  mode: ExaminationScheduleFormMode;
  initialValues?: IExaminationScheduleResponse;
  onClose: () => void;
}

type FormValues = {
  classId: string;
  subjectId: string;
  roomId: string;
  invigilator1Id: string;
  invigilator2Id: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  scheduleType: string;
};

const emptyFormValues: FormValues = {
  classId: "",
  subjectId: "",
  roomId: "",
  invigilator1Id: "",
  invigilator2Id: "",
  date: null,
  startTime: "",
  endTime: "",
  scheduleType: "",
};

const buildLocalDateTimeString = (date: Date, time: string) => {
  const [hours = "00", minutes = "00"] = time.split(":");
  return dayjs(date)
    .hour(Number(hours))
    .minute(Number(minutes))
    .second(0)
    .millisecond(0)
    .format("YYYY-MM-DDTHH:mm:ss");
};

const buildComparableState = (values: FormValues) => ({
  classId: values.classId,
  subjectId: values.subjectId,
  roomId: values.roomId,
  invigilator1Id: values.invigilator1Id,
  invigilator2Id: values.invigilator2Id,
  date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : "",
  startTime: values.startTime,
  endTime: values.endTime,
  scheduleType: values.scheduleType.trim(),
});

export function ExaminationScheduleFormModel({
  open,
  mode,
  initialValues,
  onClose,
}: ExaminationScheduleFormModelProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const examScheduleId = initialValues?.id;

  const [formValues, setFormValues] = useState<FormValues>(emptyFormValues);
  const [errors, setErrors] = useState({
    classId: "",
    subjectId: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [isChanged, setIsChanged] = useState(false);

  const [classSearch, setClassSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  const { data: classes = [] } = useClassesDropDown({
    limit: 10,
    skip: 0,
    search: classSearch || undefined,
  });
  const { data: selectedClasses = [] } = useClassesDropDownByIds(
    formValues.classId ? { ids: [formValues.classId] } : { ids: [] }
  );
  const safeClasses = Array.isArray(classes) ? classes : [];
  const safeSelectedClasses = Array.isArray(selectedClasses) ? selectedClasses : [];

  const { data: subjects = [] } = useSubjectDropDown({
    limit: 10,
    skip: 0,
    search: subjectSearch || undefined,
  });
  const { data: selectedSubjects = [] } = useSubjectDropDownByIds(
    formValues.subjectId ? { ids: [formValues.subjectId] } : { ids: [] }
  );

  const { data: rooms = [] } = useRoomDropDown({
    limit: 10,
    skip: 0,
    search: roomSearch || undefined,
  });
  const { data: selectedRooms = [] } = useRoomDropDownByIds(
    formValues.roomId ? { ids: [formValues.roomId] } : { ids: [] }
  );

  const { data: teachers = [] } = useTeacherDropdown({
    limit: 10,
    skip: 0,
    search: teacherSearch || undefined,
  });
  const { data: selectedTeachers = [] } = useTeacherDropdownByIds(
    formValues.invigilator1Id || formValues.invigilator2Id
      ? {
          ids: [
            ...(formValues.invigilator1Id ? [formValues.invigilator1Id] : []),
            ...(formValues.invigilator2Id ? [formValues.invigilator2Id] : []),
          ],
        }
      : { ids: [] }
  );

  const classOptions = useMemo(
    () =>
      Array.from(
        new Map([...safeSelectedClasses, ...safeClasses].map((item) => [item.id, item])).values()
      ),
    [safeSelectedClasses, safeClasses]
  );
  const subjectOptions = useMemo(
    () =>
      Array.from(
        new Map([...selectedSubjects, ...subjects].map((item) => [item.id, item])).values()
      ),
    [selectedSubjects, subjects]
  );
  const roomOptions = useMemo(
    () =>
      Array.from(new Map([...selectedRooms, ...rooms].map((item) => [item.id, item])).values()),
    [selectedRooms, rooms]
  );
  const teacherOptions = useMemo(
    () =>
      Array.from(
        new Map([...selectedTeachers, ...teachers].map((item) => [item.id, item])).values()
      ),
    [selectedTeachers, teachers]
  );

  const { mutateAsync: createExaminationSchedule } = useCreateExaminationSchedule({});
  const { mutateAsync: updateExaminationSchedule } = useUpdateExaminationSchedule();

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    isChanged,
    onClose,
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setFormValues({
        classId: initialValues.class_info?.class_id ?? "",
        subjectId: initialValues.subject_info?.subject_id ?? "",
        roomId: initialValues.room_info?.room_id ?? "",
        invigilator1Id: initialValues.invigilator[0]?.invigilator_id ?? "",
        invigilator2Id: initialValues.invigilator[1]?.invigilator_id ?? "",
        date: initialValues.date ? new Date(initialValues.date) : null,
        startTime: initialValues.start_time ? dayjs(initialValues.start_time).format("HH:mm") : "",
        endTime: initialValues.end_time ? dayjs(initialValues.end_time).format("HH:mm") : "",
        scheduleType: initialValues.schedule_type ?? "",
      });
    } else {
      setFormValues(emptyFormValues);
    }

    setErrors({
      classId: "",
      subjectId: "",
      date: "",
      startTime: "",
      endTime: "",
    });
    setIsChanged(false);
  }, [mode, initialValues, open]);

  useEffect(() => {
    const currentState = buildComparableState(formValues);

    if (mode === "edit" && initialValues) {
      const initialState = buildComparableState({
        classId: initialValues.class_info?.class_id ?? "",
        subjectId: initialValues.subject_info?.subject_id ?? "",
        roomId: initialValues.room_info?.room_id ?? "",
        invigilator1Id: initialValues.invigilator[0]?.invigilator_id ?? "",
        invigilator2Id: initialValues.invigilator[1]?.invigilator_id ?? "",
        date: initialValues.date ? new Date(initialValues.date) : null,
        startTime: initialValues.start_time ? dayjs(initialValues.start_time).format("HH:mm") : "",
        endTime: initialValues.end_time ? dayjs(initialValues.end_time).format("HH:mm") : "",
        scheduleType: initialValues.schedule_type ?? "",
      });

      setIsChanged(JSON.stringify(currentState) !== JSON.stringify(initialState));
      return;
    }

    const hasInput =
      currentState.classId !== "" ||
      currentState.subjectId !== "" ||
      currentState.roomId !== "" ||
      currentState.invigilator1Id !== "" ||
      currentState.invigilator2Id !== "" ||
      currentState.date !== "" ||
      currentState.startTime !== "" ||
      currentState.endTime !== "" ||
      currentState.scheduleType !== "";

    setIsChanged(hasInput);
  }, [formValues, mode, initialValues]);

  const validateForm = () => {
    const nextErrors = {
      classId: "",
      subjectId: "",
      date: "",
      startTime: "",
      endTime: "",
    };
    let isValid = true;

    if (!isRequired(formValues.classId)) {
      nextErrors.classId = t("examinationSchedules.form.errors.classRequired");
      isValid = false;
    }

    if (!isRequired(formValues.subjectId)) {
      nextErrors.subjectId = t("examinationSchedules.form.errors.subjectRequired");
      isValid = false;
    }

    if (!formValues.date) {
      nextErrors.date = t("examinationSchedules.form.errors.dateRequired");
      isValid = false;
    }

    if (!formValues.startTime) {
      nextErrors.startTime = t("examinationSchedules.form.errors.startTimeRequired");
      isValid = false;
    }

    if (!formValues.endTime) {
      nextErrors.endTime = t("examinationSchedules.form.errors.endTimeRequired");
      isValid = false;
    }

    if (formValues.startTime && formValues.endTime) {
      const [startHours, startMinutes] = formValues.startTime.split(":").map(Number);
      const [endHours, endMinutes] = formValues.endTime.split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      if (endTotalMinutes <= startTotalMinutes) {
        nextErrors.endTime = t("examinationSchedules.form.errors.endTimeAfterStart");
        isValid = false;
      }
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !formValues.date || !formValues.startTime || !formValues.endTime) {
      return;
    }

    const payload: IExaminationScheduleCreatePayload = {
      class_id: formValues.classId,
      subject_id: formValues.subjectId,
      date: `${dayjs(formValues.date).format("YYYY-MM-DD")}T00:00:00`,
      start_time: buildLocalDateTimeString(formValues.date, formValues.startTime),
      end_time: buildLocalDateTimeString(formValues.date, formValues.endTime),
      room_id: formValues.roomId || null,
      invigilator_1_id: formValues.invigilator1Id || null,
      invigilator_2_id: formValues.invigilator2Id || null,
      schedule_type: formValues.scheduleType.trim() || null,
      status: initialValues?.status ?? STATUS.ACTIVE,
    };

    try {
      if (mode === "add") {
        await createExaminationSchedule(payload);
      } else if (mode === "edit" && examScheduleId) {
        const updatePayload: IExaminationScheduleUpdatePayload = {
          ...payload,
          updated_at: dayjs().toISOString(),
        };
        await updateExaminationSchedule({ id: examScheduleId, data: updatePayload });
      }

      showSnackbar(
        mode === "add"
          ? t("examinationSchedules.form.messages.addSuccess")
          : t("examinationSchedules.form.messages.updateSuccess"),
        "success"
      );
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar(t("examinationSchedules.form.messages.genericError"), "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseClick}
      className="primary-dialog department-form"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="primary-dialog-title">
        {mode === "add" ? t("examinationSchedules.form.titleAdd") : t("examinationSchedules.form.titleEdit")}
      </DialogTitle>

      <DialogContent className="primary-dialog-content">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.class")} required />
              <MainAutocomplete
                options={classOptions}
                value={formValues.classId || null}
                onChange={(id) => setFormValues((prev) => ({ ...prev, classId: id }))}
                onSearchChange={setClassSearch}
                getOptionLabel={(option: any) =>
                  option?.class_code
                    ? `${option.class_code} - ${option.class_name ?? ""}`.trim()
                    : option?.class_name ?? ""
                }
                getOptionId={(option: any) => option?.id?.toString() ?? ""}
                placeholder={t("examinationSchedules.form.placeholders.selectClass")}
                error={!!errors.classId}
                helperText={errors.classId}
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.subject")} required />
              <MainAutocomplete
                options={subjectOptions}
                value={formValues.subjectId || null}
                onChange={(id) => setFormValues((prev) => ({ ...prev, subjectId: id }))}
                onSearchChange={setSubjectSearch}
                getOptionLabel={(option: any) =>
                  option?.subject_code
                    ? `${option.subject_code} - ${option.name ?? ""}`.trim()
                    : option?.name ?? ""
                }
                getOptionId={(option: any) => option?.id?.toString() ?? ""}
                placeholder={t("examinationSchedules.form.placeholders.selectSubject")}
                error={!!errors.subjectId}
                helperText={errors.subjectId}
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.date")} required />
              <DatePicker
                value={formValues.date}
                onChange={(newValue) =>
                  setFormValues((prev) => ({ ...prev, date: newValue }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    className: "main-text__field primary-dialog-input",
                    error: !!errors.date,
                    helperText: errors.date,
                  },
                }}
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.scheduleType")} />
              <TextField
                value={formValues.scheduleType}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, scheduleType: event.target.value }))
                }
                fullWidth
                variant="outlined"
                placeholder={t("examinationSchedules.form.placeholders.scheduleType")}
                className="main-text__field primary-dialog-input"
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.startTime")} required />
              <TextField
                type="time"
                value={formValues.startTime}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, startTime: event.target.value }))
                }
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                className="main-text__field primary-dialog-input"
                error={!!errors.startTime}
                helperText={errors.startTime}
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.endTime")} required />
              <TextField
                type="time"
                value={formValues.endTime}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, endTime: event.target.value }))
                }
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                className="main-text__field primary-dialog-input"
                error={!!errors.endTime}
                helperText={errors.endTime}
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.room")} />
              <MainAutocomplete
                options={roomOptions}
                value={formValues.roomId || null}
                onChange={(id) => setFormValues((prev) => ({ ...prev, roomId: id }))}
                onSearchChange={setRoomSearch}
                getOptionLabel={(option: any) =>
                  option?.room_number ? t("examinationSchedules.roomLabel", { room: option.room_number }) : ""
                }
                getOptionId={(option: any) => option?.id?.toString() ?? ""}
                placeholder={t("examinationSchedules.form.placeholders.selectRoom")}
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.invigilator1")} />
              <MainAutocomplete
                options={teacherOptions}
                value={formValues.invigilator1Id || null}
                onChange={(id) => setFormValues((prev) => ({ ...prev, invigilator1Id: id }))}
                onSearchChange={setTeacherSearch}
                getOptionLabel={(option: any) =>
                  option?.name
                    ? `${option.name}${option?.teacher_code ? ` - ${option.teacher_code}` : ""}`
                    : ""
                }
                getOptionId={(option: any) => option?.id?.toString() ?? ""}
                placeholder={t("examinationSchedules.form.placeholders.selectInvigilator1")}
              />
            </Grid>

            <Grid size={6}>
              <LabelPrimary value={t("examinationSchedules.form.labels.invigilator2")} />
              <MainAutocomplete
                options={teacherOptions}
                value={formValues.invigilator2Id || null}
                onChange={(id) => setFormValues((prev) => ({ ...prev, invigilator2Id: id }))}
                onSearchChange={setTeacherSearch}
                getOptionLabel={(option: any) =>
                  option?.name
                    ? `${option.name}${option?.teacher_code ? ` - ${option.teacher_code}` : ""}`
                    : ""
                }
                getOptionId={(option: any) => option?.id?.toString() ?? ""}
                placeholder={t("examinationSchedules.form.placeholders.selectInvigilator2")}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          {t("examinationSchedules.common.cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === "add" ? t("examinationSchedules.common.add") : t("examinationSchedules.common.save")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title={t("examinationSchedules.confirm.exitTitle")}
        message={t("examinationSchedules.confirm.exitMessage")}
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />
    </Dialog>
  );
}

export default ExaminationScheduleFormModel;
