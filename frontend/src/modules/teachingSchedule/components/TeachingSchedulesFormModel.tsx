import React, { useEffect, useMemo, useState } from "react";
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
import { useTranslation } from "react-i18next";

import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";

import { STATUS } from "../../../constants/status";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import {
  isRequired,
  positiveIntegerSlotProps,
} from "../../../utils/validation/validations";

import { useClassesDropDown } from "../../classes/apis/getClassDropDown";
import { useClassesDropDownByIds } from "../../classes/apis/getClassDropDownByIds";
import { useTeacherDropdown } from "../../teachers/apis/getTeacherDropDown";
import { useTeacherDropdownByIds } from "../../teachers/apis/getTeacherDropDownByIds";
import { useRoomDropDown } from "../apis/getRoomDropDown";
import { useRoomDropDownByIds } from "../apis/getRoomDropDownByIds";
import { useSubjectDropDown } from "../apis/getSubjectDropDown";
import { useSubjectDropDownByIds } from "../apis/getSubjectDropDownByIds";
import { useCreateTeachingSchedule } from "../apis/addTeachingSchedule";
import { useUpdateTeachingSchedule } from "../apis/updateTeachingSchedule";
import type {
  ITeachingScheduleCreatePayload,
  ITeachingScheduleResponse,
  ITeachingScheduleUpdatePayload,
} from "../types";

interface TeachingSchedulesFormProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: ITeachingScheduleResponse;
  onClose: () => void;
}

const TeachingSchedulesFormModel: React.FC<TeachingSchedulesFormProps> = ({
  open,
  mode,
  initialValues,
  onClose,
}) => {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const id = initialValues?.id;
  const isEdit = mode === "edit";

  const [formValues, setFormValues] = useState({
    classId: "",
    classCode: "",
    className: "",
    teacherId: "",
    teacherName: "",
    roomId: "",
    roomNumber: "",
    roomType: "",
    subjectId: "",
    subjectCode: "",
    subjectName: "",
    date: new Date(),
    startPeriod: 1,
    endPeriod: 1,
    scheduleType: "theory",
  });

  const [errors, setErrors] = useState({
    classId: "",
    subjectId: "",
    date: "",
    startPeriod: "",
    endPeriod: "",
  });

  const [confirm, setConfirm] = useState({
    save: false,
    pendingCreatePayload: null as ITeachingScheduleCreatePayload | null,
    pendingUpdatePayload: null as ITeachingScheduleUpdatePayload | null,
  });

  const [isChanged, setIsChanged] = useState(false);

  const [classPage, setClassPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const [roomPage, setRoomPage] = useState(1);
  const [subjectPage, setSubjectPage] = useState(1);

  const [searchClass, setSearchClass] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [searchSubject, setSearchSubject] = useState("");

  const { data: classes = [] } = useClassesDropDown({
    limit: 5,
    skip: (classPage - 1) * 5,
    search: searchClass || undefined,
  });
  const { data: selectedClasses = [] } = useClassesDropDownByIds(
    formValues.classId ? { ids: [formValues.classId] } : { ids: [] }
  );
  const safeClasses = Array.isArray(classes) ? classes : [];
  const safeSelectedClasses = Array.isArray(selectedClasses) ? selectedClasses : [];

  const { data: teachers = [] } = useTeacherDropdown({
    limit: 5,
    skip: (teacherPage - 1) * 5,
    search: searchTeacher || undefined,
  });
  const { data: selectedTeachers = [] } = useTeacherDropdownByIds(
    formValues.teacherId ? { ids: [formValues.teacherId] } : { ids: [] }
  );

  const { data: rooms = [] } = useRoomDropDown({
    limit: 5,
    skip: (roomPage - 1) * 5,
    search: searchRoom || undefined,
  });
  const { data: selectedRooms = [] } = useRoomDropDownByIds(
    formValues.roomId ? { ids: [formValues.roomId] } : { ids: [] }
  );

  const { data: subjects = [] } = useSubjectDropDown({
    limit: 5,
    skip: (subjectPage - 1) * 5,
    search: searchSubject || undefined,
  });
  const { data: selectedSubjects = [] } = useSubjectDropDownByIds(
    formValues.subjectId ? { ids: [formValues.subjectId] } : { ids: [] }
  );
  const classOptions = useMemo(
    () => Array.from(new Map([...safeSelectedClasses, ...safeClasses].map((item) => [item.id, item])).values()),
    [safeSelectedClasses, safeClasses]
  );
  const teacherOptions = useMemo(
    () => Array.from(new Map([...selectedTeachers, ...teachers].map((item) => [item.id, item])).values()),
    [selectedTeachers, teachers]
  );
  const roomOptions = useMemo(
    () => Array.from(new Map([...selectedRooms, ...rooms].map((item) => [item.id, item])).values()),
    [selectedRooms, rooms]
  );
  const subjectOptions = useMemo(
    () => Array.from(new Map([...selectedSubjects, ...subjects].map((item) => [item.id, item])).values()),
    [selectedSubjects, subjects]
  );

  const { mutateAsync: createTeachingSchedule } = useCreateTeachingSchedule({});
  const { mutateAsync: updateTeachingSchedule } = useUpdateTeachingSchedule();

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    isChanged,
    onClose,
  });

  useEffect(() => {
    if (isEdit && initialValues) {
      setFormValues({
        classId: initialValues.class?.class_id || initialValues.learning_schedule.class_id,
        classCode: initialValues.class?.class_code || "",
        className:
          initialValues.class?.class_name ||
          initialValues.learning_schedule.class_id ||
          "",
        teacherId: initialValues.teacher?.teacher_id || "",
        teacherName: initialValues.teacher?.teacher_name || "",
        roomId:
          initialValues.room?.room_id || initialValues.learning_schedule.room_id || "",
        roomNumber:
          initialValues.room?.room_number?.toString() ||
          initialValues.learning_schedule.room_id ||
          "",
        roomType: "",
        subjectId:
          initialValues.subject?.subject_id || initialValues.learning_schedule.subject_id,
        subjectCode: "",
        subjectName: initialValues.subject?.subject_name || "",
        date: initialValues.learning_schedule.date
          ? new Date(initialValues.learning_schedule.date)
          : new Date(),
        startPeriod: initialValues.learning_schedule.start_period || 1,
        endPeriod: initialValues.learning_schedule.end_period || 1,
        scheduleType: initialValues.learning_schedule.schedule_type || "theory",
      });
    } else {
      setFormValues({
        classId: "",
        classCode: "",
        className: "",
        teacherId: "",
        teacherName: "",
        roomId: "",
        roomNumber: "",
        roomType: "",
        subjectId: "",
        subjectCode: "",
        subjectName: "",
        date: new Date(),
        startPeriod: 1,
        endPeriod: 1,
        scheduleType: "theory",
      });
    }

    setErrors({
      classId: "",
      subjectId: "",
      date: "",
      startPeriod: "",
      endPeriod: "",
    });
    setIsChanged(false);
    setConfirm({
      save: false,
      pendingCreatePayload: null,
      pendingUpdatePayload: null,
    });
  }, [isEdit, initialValues, open]);

  useEffect(() => {
    if (isEdit && initialValues) {
      const currentComparable = {
        teacher_id: formValues.teacherId || null,
        learning_schedule: {
          class_id: formValues.classId,
          subject_id: formValues.subjectId,
          date: dayjs(formValues.date).valueOf(),
          start_period: formValues.startPeriod,
          end_period: formValues.endPeriod,
          room_id: formValues.roomId || null,
          schedule_type: formValues.scheduleType || null,
        },
      };

      const initialComparable = {
        teacher_id: initialValues.teacher?.teacher_id || null,
        learning_schedule: {
          class_id: initialValues.learning_schedule.class_id,
          subject_id: initialValues.learning_schedule.subject_id,
          date: dayjs(initialValues.learning_schedule.date).valueOf(),
          start_period: initialValues.learning_schedule.start_period,
          end_period: initialValues.learning_schedule.end_period,
          room_id: initialValues.learning_schedule.room_id || null,
          schedule_type: initialValues.learning_schedule.schedule_type || null,
        },
      };

      setIsChanged(
        JSON.stringify(currentComparable) !== JSON.stringify(initialComparable)
      );
      return;
    }

    const hasInput =
      formValues.classId !== "" ||
      formValues.teacherId !== "" ||
      formValues.roomId !== "" ||
      formValues.subjectId !== "" ||
      formValues.startPeriod !== 1 ||
      formValues.endPeriod !== 1 ||
      formValues.scheduleType.trim().toLowerCase() !== "theory";
    setIsChanged(hasInput);
  }, [formValues, isEdit, initialValues]);

  const validateForm = (): boolean => {
    const nextErrors = {
      classId: "",
      subjectId: "",
      date: "",
      startPeriod: "",
      endPeriod: "",
    };
    let isValid = true;

    if (!isRequired(formValues.classId)) {
      nextErrors.classId = t("teachingSchedules.form.errors.classRequired");
      isValid = false;
    }

    if (!isRequired(formValues.subjectId)) {
      nextErrors.subjectId = t("teachingSchedules.form.errors.subjectRequired");
      isValid = false;
    }

    if (!formValues.date) {
      nextErrors.date = t("teachingSchedules.form.errors.dateRequired");
      isValid = false;
    }

    if (!Number.isFinite(formValues.startPeriod) || formValues.startPeriod <= 0) {
      nextErrors.startPeriod = t("teachingSchedules.form.errors.startPeriodPositive");
      isValid = false;
    }

    if (!Number.isFinite(formValues.endPeriod) || formValues.endPeriod <= 0) {
      nextErrors.endPeriod = t("teachingSchedules.form.errors.endPeriodPositive");
      isValid = false;
    } else if (formValues.endPeriod < formValues.startPeriod) {
      nextErrors.endPeriod = t("teachingSchedules.form.errors.endPeriodAfterStart");
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleSubmitClick = () => {
    if (!validateForm()) return;

    if (isEdit) {
      const updatePayload: ITeachingScheduleUpdatePayload = {
        teacher_id: formValues.teacherId || null,
        status: initialValues?.status || STATUS.ACTIVE,
        learning_schedule: {
          class_id: formValues.classId,
          subject_id: formValues.subjectId,
          date: dayjs(formValues.date).toISOString(),
          start_period: formValues.startPeriod,
          end_period: formValues.endPeriod,
          room_id: formValues.roomId || null,
          schedule_type: formValues.scheduleType || null,
          status: initialValues?.learning_schedule.status || STATUS.ACTIVE,
        },
      };

      if (!isChanged) return;

      setConfirm({
        save: true,
        pendingCreatePayload: null,
        pendingUpdatePayload: updatePayload,
      });
      return;
    }

    const createPayload: ITeachingScheduleCreatePayload = {
      teacher_id: formValues.teacherId || null,
      status: STATUS.ACTIVE,
      learning_schedule: {
        class_id: formValues.classId,
        subject_id: formValues.subjectId,
        date: dayjs(formValues.date).toISOString(),
        start_period: formValues.startPeriod,
        end_period: formValues.endPeriod,
        room_id: formValues.roomId || null,
        schedule_type: formValues.scheduleType || null,
        status: STATUS.ACTIVE,
      },
    };

    setConfirm({
      save: true,
      pendingCreatePayload: createPayload,
      pendingUpdatePayload: null,
    });
  };

  const handleConfirmSave = async () => {
    try {
      if (isEdit && id && confirm.pendingUpdatePayload) {
        await updateTeachingSchedule({
          id,
          data: confirm.pendingUpdatePayload,
        });
      } else if (!isEdit && confirm.pendingCreatePayload) {
        await createTeachingSchedule(confirm.pendingCreatePayload);
      } else {
        return;
      }

      showSnackbar(
        isEdit
          ? t("teachingSchedules.form.messages.updateSuccess")
          : t("teachingSchedules.form.messages.addSuccess"),
        "success"
      );

      setConfirm({
        save: false,
        pendingCreatePayload: null,
        pendingUpdatePayload: null,
      });
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar(t("teachingSchedules.form.messages.genericError"), "error");
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
        {isEdit ? t("teachingSchedules.form.titleEdit") : t("teachingSchedules.form.titleAdd")}
      </DialogTitle>

      <DialogContent className="primary-dialog-content">
        <Grid container spacing={2}>
          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.class")} required />
            <MainAutocomplete
              options={classOptions}
              value={
                formValues.classId
                  ? {
                      id: formValues.classId,
                      class_code: formValues.classCode,
                      class_name: formValues.className,
                    }
                  : null
              }
              onChange={(selectedId) => {
                const selected = classOptions.find(
                  (item) => item.id.toString() === selectedId
                );
                setFormValues((prev) => ({
                  ...prev,
                  classId: selectedId,
                  classCode: selected?.class_code || "",
                  className: selected?.class_name || "",
                }));
                setErrors((prev) => ({ ...prev, classId: "" }));
              }}
              onSearchChange={setSearchClass}
              onResetPage={() => setClassPage(1)}
              getOptionLabel={(option) =>
                `${option.class_code} - ${option.class_name || ""}`
              }
              getOptionId={(option) => option.id?.toString() || ""}
              className="primary-dialog-input"
              error={Boolean(errors.classId)}
              helperText={errors.classId}
            />
          </Grid>

          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.teacher")} />
            <MainAutocomplete
              options={teacherOptions}
              value={
                formValues.teacherId
                  ? {
                      id: formValues.teacherId,
                      name: formValues.teacherName,
                    }
                  : null
              }
              onChange={(selectedId) => {
                const selected = teacherOptions.find(
                  (item) => item.id.toString() === selectedId
                );
                setFormValues((prev) => ({
                  ...prev,
                  teacherId: selectedId,
                  teacherName: selected?.name || "",
                }));
              }}
              onSearchChange={setSearchTeacher}
              onResetPage={() => setTeacherPage(1)}
              getOptionLabel={(option) => option.name}
              getOptionId={(option) => option.id?.toString() || ""}
              className="primary-dialog-input"
            />
          </Grid>

          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.subject")} required />
            <MainAutocomplete
              options={subjectOptions}
              value={
                formValues.subjectId
                  ? {
                      id: formValues.subjectId,
                      subject_code: formValues.subjectCode,
                      name: formValues.subjectName,
                    }
                  : null
              }
              onChange={(selectedId) => {
                const selected = subjectOptions.find(
                  (item) => item.id.toString() === selectedId
                );
                setFormValues((prev) => ({
                  ...prev,
                  subjectId: selectedId,
                  subjectCode: selected?.subject_code || "",
                  subjectName: selected?.name || "",
                }));
                setErrors((prev) => ({ ...prev, subjectId: "" }));
              }}
              onSearchChange={setSearchSubject}
              onResetPage={() => setSubjectPage(1)}
              getOptionLabel={(option) => `${option.subject_code} - ${option.name}`}
              getOptionId={(option) => option.id?.toString() || ""}
              className="primary-dialog-input"
              error={Boolean(errors.subjectId)}
              helperText={errors.subjectId}
            />
          </Grid>

          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.room")} />
            <MainAutocomplete
              options={roomOptions}
              value={
                formValues.roomId
                  ? {
                      id: formValues.roomId,
                      room_number: Number(formValues.roomNumber),
                      type: formValues.roomType,
                      seats: roomOptions.find((item) => item.id.toString() === formValues.roomId)?.seats ?? 0,
                    }
                  : null
              }
              onChange={(selectedId) => {
                const selected = roomOptions.find(
                  (item) => item.id.toString() === selectedId
                );
                setFormValues((prev) => ({
                  ...prev,
                  roomId: selectedId,
                  roomNumber:
                    selected?.room_number !== undefined
                      ? String(selected.room_number)
                      : "",
                  roomType: selected?.type || "",
                }));
              }}
              onSearchChange={setSearchRoom}
              onResetPage={() => setRoomPage(1)}
              getOptionLabel={(option) =>
                `${t("teachingSchedules.roomLabel", { room: option.room_number })} - ${option.type} (${option.seats} chỗ)`
              }
              getOptionId={(option) => option.id?.toString() || ""}
              className="primary-dialog-input"
            />
          </Grid>

          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.date")} required />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={formValues.date}
                onChange={(newValue) => {
                  setFormValues((prev) => ({
                    ...prev,
                    date: newValue || new Date(),
                  }));
                  setErrors((prev) => ({ ...prev, date: "" }));
                }}
                className="main-text__field primary-dialog-input"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.date),
                    helperText: errors.date,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.scheduleType")} />
            <TextField
              value={formValues.scheduleType}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  scheduleType: e.target.value,
                }))
              }
              fullWidth
              variant="outlined"
              className="main-text__field primary-dialog-input"
            />
          </Grid>

          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.startPeriod")} required />
            <TextField
              type="number"
              value={formValues.startPeriod}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  startPeriod: Number(e.target.value),
                }))
              }
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  startPeriod:
                    formValues.startPeriod > 0
                      ? ""
                      : t("teachingSchedules.form.errors.startPeriodPositive"),
                }))
              }
              fullWidth
              variant="outlined"
              className="main-text__field primary-dialog-input"
              error={Boolean(errors.startPeriod)}
              helperText={errors.startPeriod}
              slotProps={positiveIntegerSlotProps}
            />
          </Grid>

          <Grid size={6}>
            <LabelPrimary value={t("teachingSchedules.form.labels.endPeriod")} required />
            <TextField
              type="number"
              value={formValues.endPeriod}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  endPeriod: Number(e.target.value),
                }))
              }
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  endPeriod:
                    formValues.endPeriod >= formValues.startPeriod
                      ? ""
                      : t("teachingSchedules.form.errors.endPeriodAfterStart"),
                }))
              }
              fullWidth
              variant="outlined"
              className="main-text__field primary-dialog-input"
              error={Boolean(errors.endPeriod)}
              helperText={errors.endPeriod}
              slotProps={positiveIntegerSlotProps}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          {t("teachingSchedules.common.cancel")}
        </Button>
        <Button onClick={handleSubmitClick} variant="contained" disabled={!isChanged}>
          {isEdit ? t("teachingSchedules.common.save") : t("teachingSchedules.common.add")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title={t("teachingSchedules.confirm.exitTitle")}
        message={t("teachingSchedules.confirm.exitMessage")}
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />

      <ConfirmDialog
        open={confirm.save}
        title={t("teachingSchedules.confirm.saveTitle")}
        message={t("teachingSchedules.confirm.saveMessage")}
        onConfirm={handleConfirmSave}
        onCancel={() =>
          setConfirm({
            save: false,
            pendingCreatePayload: null,
            pendingUpdatePayload: null,
          })
        }
      />
    </Dialog>
  );
};

export default TeachingSchedulesFormModel;
