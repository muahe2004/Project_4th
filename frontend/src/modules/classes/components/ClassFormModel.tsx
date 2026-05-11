import React, { useMemo, useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";

import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";

import { useConfirmCloseForm } from "../../../hooks/useConfirm";

import { useCreateClass } from "../apis/addClass";
import { useEditClass } from "../apis/editClass";
import { useTeacherDropdown } from "../../teachers/apis/getTeacherDropDown";
import { useTeacherDropdownByIds } from "../../teachers/apis/getTeacherDropDownByIds";
import { useSpecializationsDropDown } from "../../specializations/apis/getSpecializationDropDown";
import { useSpecializationsDropDownByIds } from "../../specializations/apis/getSpecializationDropDownByIds";
import { useSubjectDropDown } from "../../teachingSchedule/apis/getSubjectDropDown";
import { useSubjectDropDownByIds } from "../../teachingSchedule/apis/getSubjectDropDownByIds";

import { hasObjectChanged } from "../../../utils/checkChangeValues";
import {
    isRequired,
} from "../../../utils/validation/validations";
import { STATUS } from "../../../constants/status";
import { CLASSTYPE, REGISTRATION_STATUS_OPTIONS } from "../../../constants/classes";
import type { IClasses, IClassesResponse } from "../types";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";

interface ClassFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IClassesResponse;
    onClose: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({
    open,
    mode,
    initialValues,
    onClose,
}) => {
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const ID = initialValues?.id;

    const [formValues, setFormValues] = useState({
        classCode: "",
        className: "",
        size: 0,
        classType: "",
        registrationStatus: "closed",
        registrationOpenAt: "",
        registrationCloseAt: "",
        subjectId: "",
        teacherId: "",
        teacherName: "",
        specializationId: "",
        specializationName: "",
    });

    const [errors, setErrors] = useState({
        classCode: "",
        className: "",
        size: "",
        classType: "",
        registrationStatus: "",
        registrationOpenAt: "",
        registrationCloseAt: "",
        subjectId: "",
        teacherId: "",
        teacherName: "",
        specializationId: "",
        specializationName: "",
    });

    const [confirm, setConfirm] = useState({
        close: false,
        save: false,
        pendingPayload: null as IClasses | null,
    });

    const [isChanged, setIsChanged] = useState(false);

    const [teacherPage, setTeacherPage] = useState(1);
    const [specializationPage, setSpecializationPage] = useState(1);
    const [subjectPage, setSubjectPage] = useState(1);
    const [searchTeacher, setSearchTeacher] = useState("");
    const [searchSpecialization, setSearchSpecialization] = useState("");
    const [searchSubject, setSearchSubject] = useState("");

    const { data: teacher = [] } = useTeacherDropdown({
        limit: 5,
        skip: (teacherPage - 1) * 5,
        search: searchTeacher || undefined,
    });
    const { data: selectedTeacherOptions = [] } = useTeacherDropdownByIds(
        formValues.teacherId ? { ids: [formValues.teacherId] } : { ids: [] }
    );

    const { data: specializations = [] } = useSpecializationsDropDown({
        limit: 5,
        skip: (specializationPage - 1) * 5,
        search: searchSpecialization || undefined,
    });
    const { data: selectedSpecializationOptions = [] } = useSpecializationsDropDownByIds(
        formValues.specializationId ? { ids: [formValues.specializationId] } : { ids: [] }
    );
    const { data: subjects = [] } = useSubjectDropDown({
        limit: 5,
        skip: (subjectPage - 1) * 5,
        search: searchSubject || undefined,
    });
    const { data: selectedSubjectOptions = [] } = useSubjectDropDownByIds(
        formValues.subjectId ? { ids: [formValues.subjectId] } : { ids: [] }
    );
    const teacherOptions = useMemo(
        () => Array.from(new Map([...selectedTeacherOptions, ...teacher].map((item) => [item.id, item])).values()),
        [selectedTeacherOptions, teacher]
    );
    const specializationOptions = useMemo(
        () => Array.from(new Map([...selectedSpecializationOptions, ...specializations].map((item) => [item.id, item])).values()),
        [selectedSpecializationOptions, specializations]
    );
    const subjectOptions = useMemo(
        () => Array.from(new Map([...selectedSubjectOptions, ...subjects].map((item) => [item.id, item])).values()),
        [selectedSubjectOptions, subjects]
    );

    const { openConfirm, setOpenConfirm, handleCloseClick } =
        useConfirmCloseForm({ mode, isChanged, onClose });

    const { mutateAsync: createClass } = useCreateClass({});
    const { mutateAsync: editClass } = useEditClass({});

    const validationRules: Record<keyof typeof formValues, (value: any) => string> = {
        classCode: (value) => (!isRequired(value) ? t("classes.form.errors.classCodeRequired") : ""),
        teacherId: (value) => (!isRequired(value) ? t("classes.form.errors.teacherRequired") : ""),
        specializationId: (value) => (!isRequired(value) ? t("classes.form.errors.specializationRequired") : ""),
        className: () => "",
        size: () => "",
        classType: () => "",
        registrationStatus: () => "",
        registrationOpenAt: () => "",
        registrationCloseAt: () => "",
        subjectId: () => "",
        teacherName: () => "",
        specializationName: () => "",
    };

    const validateRegistrationWindow = (openAt: string, closeAt: string): string => {
        if (!openAt || !closeAt) {
            return "";
        }
        if (dayjs(openAt).isAfter(dayjs(closeAt))) {
            return t("classes.form.errors.registrationWindow");
        }
        return "";
    };

    const toInputDateTime = (value?: string | null): string => {
        if (!value) {
            return "";
        }
        const parsed = dayjs(value);
        if (!parsed.isValid()) {
            return "";
        }
        return parsed.format("YYYY-MM-DD");
    };

    const toDateValue = (value: string): Date | null => {
        if (!value) {
            return null;
        }
        const parsed = dayjs(value, "YYYY-MM-DD");
        if (!parsed.isValid()) {
            return null;
        }
        return parsed.toDate();
    };

    const toDayValue = (value: Date | null): string => {
        if (!value) {
            return "";
        }
        return dayjs(value).format("YYYY-MM-DD");
    };

    const toEndOfDayDateTime = (value: string): string | null => {
        if (!value) {
            return null;
        }
        return dayjs(value).hour(23).minute(59).second(0).format("YYYY-MM-DDTHH:mm:ss");
    };

    const handleBlur = (field: keyof typeof formValues) => {
        const value = formValues[field];
        const error = validationRules[field](value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const validateForm = (): boolean => {
        let valid = true;
        const newErrors: typeof errors = { ...errors };

        (Object.keys(validationRules) as (keyof typeof formValues)[]).forEach((field) => {
            const value = formValues[field];
            const error = validationRules[field](value);
            newErrors[field] = error;
            if (error) valid = false;
        });

        const windowError = validateRegistrationWindow(
            formValues.registrationOpenAt,
            formValues.registrationCloseAt
        );
        newErrors.registrationCloseAt = windowError;
        if (windowError) {
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setFormValues({
                classCode: initialValues.class_code || "",
                className: initialValues.class_name || "",
                size: initialValues.size || 0,
                classType: initialValues.class_type || "",
                registrationStatus: initialValues.registration_status || "closed",
                registrationOpenAt: toInputDateTime(initialValues.registration_open_at),
                registrationCloseAt: toInputDateTime(initialValues.registration_close_at),
                subjectId: initialValues.subject_id || "",
                teacherId: initialValues.teacher_id || "",
                teacherName: initialValues.teacher_name || "",
                specializationId: initialValues.specialization_id || "",
                specializationName: initialValues.specialization_name || "",
            });
        } else {
            setFormValues({
                classCode: "",
                className: "",
                size: 0,
                classType: "",
                registrationStatus: "closed",
                registrationOpenAt: "",
                registrationCloseAt: "",
                subjectId: "",
                teacherId: "",
                teacherName: "",
                specializationId: "",
                specializationName: "",
            });
        }
        setErrors({
            classCode: "",
            className: "",
            size: "",
            classType: "",
            registrationStatus: "",
            registrationOpenAt: "",
            registrationCloseAt: "",
            subjectId: "",
            teacherId: "",
            teacherName: "",
            specializationId: "",
            specializationName: "",
        });

        setIsChanged(false);
    }, [mode, initialValues, open]);

    useEffect(() => {
        const payload: IClasses = {
            class_code: formValues.classCode.trim(),
            class_name: formValues.className.trim(),
            status: STATUS.ACTIVE,
            size: formValues.size,
            class_type: formValues.classType.trim() || null,
            registration_status: formValues.registrationStatus || "closed",
            registration_open_at: toEndOfDayDateTime(formValues.registrationOpenAt),
            registration_close_at: toEndOfDayDateTime(formValues.registrationCloseAt),
            subject_id: formValues.subjectId || null,
            specialization_id: formValues.specializationId,
            teacher_id: formValues.teacherId,
            ...(mode === "edit" ? { updated_at: dayjs().format("YYYY-MM-DD") } : {}),
        };

        if (mode === "edit" && initialValues) {
            const hasChanges = hasObjectChanged(payload, initialValues, [], ["updated_at"]);
            setIsChanged(hasChanges);
        } else {
            const hasInput =
                formValues.classCode.trim() !== "" ||
                formValues.className.trim() !== "" ||
                formValues.size !== 0 ||
                formValues.classType.trim() !== "" ||
                formValues.registrationStatus !== "closed" ||
                formValues.registrationOpenAt !== "" ||
                formValues.registrationCloseAt !== "" ||
                formValues.subjectId !== "" ||
                formValues.teacherId !== "" ||
                formValues.specializationId !== "";
            setIsChanged(hasInput);
        }
    }, [formValues, mode, initialValues]);

    const handleSubmitClick = () => {
        if (!validateForm()) return;

        const payload: IClasses = {
            class_code: formValues.classCode.trim(),
            class_name: formValues.className.trim(),
            status: STATUS.ACTIVE,
            teacher_id: formValues.teacherId,
            specialization_id: formValues.specializationId,
            size: formValues.size,
            class_type: formValues.classType.trim() || null,
            registration_status: formValues.registrationStatus || "closed",
            registration_open_at: toEndOfDayDateTime(formValues.registrationOpenAt),
            registration_close_at: toEndOfDayDateTime(formValues.registrationCloseAt),
            subject_id: formValues.subjectId || null,
            ...(mode === "edit" ? { updated_at: dayjs().format("YYYY-MM-DD") } : {}),
        };

        if (mode === "edit" && initialValues) {
            const hasChanges = hasObjectChanged(payload, initialValues, [], ["updated_at"]);
            if (!hasChanges) {
                setOpenConfirm(false);
                return;
            }
            setConfirm({ ...confirm, pendingPayload: payload, save: true });
        } else {
            handleConfirmSave(payload);
        }
    };

    const handleConfirmSave = async (payload: IClasses) => {
        try {
            if (mode === "add") await createClass(payload);
            else if (mode === "edit" && ID)
                await editClass({ id: ID, data: payload });

            showSnackbar(
                mode === "add" ? t("classes.messages.addSuccess") : t("classes.messages.updateSuccess"),
                "success"
            );

            setConfirm({ ...confirm, save: false, pendingPayload: null });
            onClose();
        } catch (error) {
            console.error(error);
            showSnackbar(t("classes.messages.genericError"), "error");
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
                {mode === "add" ? t("classes.form.titleAdd") : t("classes.form.titleEdit")}
            </DialogTitle>

            <DialogContent className="primary-dialog-content">
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.classCode")} required />
                        <TextField
                            value={formValues.classCode}
                            onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, classCode: e.target.value }))
                            }
                            onBlur={() => handleBlur("classCode")}
                            fullWidth
                            variant="outlined"
                            className="main-text__field primary-dialog-input"
                            error={Boolean(errors.classCode)}
                            helperText={errors.classCode}
                        />
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.className")} />
                        <TextField
                            value={formValues.className}
                            onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, className: e.target.value }))
                            }
                            fullWidth
                            variant="outlined"
                            className="main-text__field primary-dialog-input"
                        />
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.size")} />
                        <TextField
                            type="number"
                            value={formValues.size}
                            onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, size: Number(e.target.value) }))
                            }
                            fullWidth
                            variant="outlined"
                            className="main-text__field primary-dialog-input"
                        />
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.classType")} />
                        <TextField
                            select
                            value={formValues.classType}
                            onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, classType: e.target.value }))
                            }
                            fullWidth
                            variant="outlined"
                            className="main-text__field primary-dialog-input"
                        >
                            {Object.values(CLASSTYPE).map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.registrationStatus")} />
                        <TextField
                            select
                            value={formValues.registrationStatus}
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    registrationStatus: e.target.value,
                                }))
                            }
                            fullWidth
                            variant="outlined"
                            className="main-text__field primary-dialog-input"
                        >
                            {Object.values(REGISTRATION_STATUS_OPTIONS).map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.registrationOpenAt")} />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                value={toDateValue(formValues.registrationOpenAt)}
                                onChange={(value) => {
                                    const nextOpenAt = toDayValue(value);
                                    const error = validateRegistrationWindow(
                                        nextOpenAt,
                                        formValues.registrationCloseAt
                                    );
                                    setFormValues((prev) => ({
                                        ...prev,
                                        registrationOpenAt: nextOpenAt,
                                    }));
                                    setErrors((prev) => ({ ...prev, registrationCloseAt: error }));
                                }}
                                className="main-text__field primary-dialog-input"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: Boolean(errors.registrationOpenAt),
                                        helperText: errors.registrationOpenAt,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.registrationCloseAt")} />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                value={toDateValue(formValues.registrationCloseAt)}
                                onChange={(value) => {
                                    const nextCloseAt = toDayValue(value);
                                    const error = validateRegistrationWindow(
                                        formValues.registrationOpenAt,
                                        nextCloseAt
                                    );
                                    setFormValues((prev) => ({
                                        ...prev,
                                        registrationCloseAt: nextCloseAt,
                                    }));
                                    setErrors((prev) => ({ ...prev, registrationCloseAt: error }));
                                }}
                                className="main-text__field primary-dialog-input"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: Boolean(errors.registrationCloseAt),
                                        helperText: errors.registrationCloseAt,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.subject")} />
                        <MainAutocomplete
                            options={subjectOptions}
                            value={
                                formValues.subjectId
                                    ? subjectOptions.find(
                                          (subject) => subject.id.toString() === formValues.subjectId
                                      ) ?? null
                                    : null
                            }
                            onChange={(id) => {
                                setFormValues((prev) => ({ ...prev, subjectId: id }));
                            }}
                            onSearchChange={setSearchSubject}
                            onResetPage={() => setSubjectPage(1)}
                            getOptionLabel={(option) =>
                                option.subject_code
                                    ? `${option.subject_code} - ${option.name}`
                                    : option.name
                            }
                            getOptionId={(option) => option.id?.toString() || ""}
                            className="primary-dialog-input"
                            placeholder={t("classes.form.placeholders.subject")}
                        />
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.specialization")} required />
                        <MainAutocomplete
                            options={specializationOptions}
                            value={
                                formValues.specializationId
                                    ? {
                                          id: formValues.specializationId,
                                          name: formValues.specializationName,
                                      }
                                    : null
                            }
                            onChange={(id) => {
                                const selected = specializationOptions.find(
                                    (s) => s.id.toString() === id
                                );
                                setFormValues((prev) => ({
                                    ...prev,
                                    specializationId: id,
                                    specializationName: selected?.name || "",
                                }));
                                setErrors((prev) => ({ ...prev, specializationId: "" }));
                            }}
                            onSearchChange={setSearchSpecialization}
                            onResetPage={() => setSpecializationPage(1)}
                            getOptionLabel={(option) => option.name}
                            getOptionId={(option) => option.id?.toString() || ""}
                            className="primary-dialog-input"
                            error={Boolean(errors.specializationId)}
                            helperText={errors.specializationId}
                        />
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value={t("classes.form.labels.teacher")} required />
                        <MainAutocomplete
                            options={teacherOptions}
                            value={
                                formValues.teacherId
                                    ? { id: formValues.teacherId, name: formValues.teacherName }
                                    : null
                            }
                            onChange={(id) => {
                                setFormValues((prev) => ({
                                    ...prev,
                                    teacherId: id,
                                    teacherName:
                                        teacherOptions.find((t) => t.id.toString() === id)?.name ||
                                        "",
                                }));
                                setErrors((prev) => ({ ...prev, teacherId: "" }));
                            }}
                            onSearchChange={setSearchTeacher}
                            onResetPage={() => setTeacherPage(1)}
                            getOptionLabel={(option) => option.name}
                            getOptionId={(option) => option.id?.toString() || ""}
                            className="primary-dialog-input"
                            error={Boolean(errors.teacherId)}
                            helperText={errors.teacherId}
                        />
                    </Grid>
                </Grid>
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
                message={t("classes.form.confirmExit")}
                onConfirm={() => {
                    setOpenConfirm(false);
                    onClose();
                }}
                onCancel={() => setOpenConfirm(false)}
            />

            <ConfirmDialog
                open={confirm.save}
                title={t("classes.form.confirmSaveTitle")}
                message={t("classes.form.confirmSave")}
                onConfirm={() => confirm.pendingPayload && handleConfirmSave(confirm.pendingPayload)}
                onCancel={() => setConfirm({ ...confirm, save: false })}
            />
        </Dialog>
    );
};

export default ClassForm;
