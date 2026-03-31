import React, { useState, useEffect } from "react";
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

import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";

import { useConfirmCloseForm } from "../../../hooks/useConfirm";

import { useCreateClass } from "../../classes/apis/addClass";
import { useEditClass } from "../../classes/apis/editClass";
import { useTeacherDropdown } from "../../teachers/apis/getTeacherDropDown";
import { useSpecializationsDropDown } from "../../specializations/apis/getSpecializationDropDown";
import { useSubjectDropDown } from "../../teachingSchedule/apis/getSubjectDropDown";
import { useSubjectDropDownByIds } from "../../teachingSchedule/apis/getSubjectDropDownByIds";

import { hasObjectChanged } from "../../../utils/checkChangeValues";
import {
    isRequired,
} from "../../../utils/validation/validations";
import { STATUS } from "../../../constants/status";
import { CLASSTYPE, REGISTRATION_STATUS_OPTIONS } from "../../../constants/classes";
import type { IClasses, IClassesResponse } from "../../classes/types";
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
    const { showSnackbar } = useSnackbar();
    const ID = initialValues?.id;

    const [formValues, setFormValues] = useState({
        classCode: "",
        className: "",
        size: 0,
        classType: "",
        registrationStatus: "closed",
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

    const { data: specializations = [] } = useSpecializationsDropDown({
        limit: 5,
        skip: (specializationPage - 1) * 5,
        search: searchSpecialization || undefined,
    });
    const { data: subjects = [] } = useSubjectDropDown({
        limit: 5,
        skip: (subjectPage - 1) * 5,
        search: searchSubject || undefined,
    });
    const { data: selectedSubjectOptions = [] } = useSubjectDropDownByIds(
        formValues.subjectId ? { ids: [formValues.subjectId] } : { ids: [] }
    );
    const teacherOptions = Array.isArray(teacher) ? teacher : [];
    const specializationOptions = Array.isArray(specializations) ? specializations : [];
    const subjectOptions = Array.from(
        new Map([...selectedSubjectOptions, ...subjects].map((item) => [item.id, item])).values()
    );

    const { openConfirm, setOpenConfirm, handleCloseClick } =
        useConfirmCloseForm({ mode, isChanged, onClose });

    const { mutateAsync: createClass } = useCreateClass({});
    const { mutateAsync: editClass } = useEditClass({});

    const validationRules: Record<keyof typeof formValues, (value: any) => string> = {
        classCode: (value) => (!isRequired(value) ? "Mã lớp là bắt buộc!" : ""),
        teacherId: (value) => (!isRequired(value) ? "Giáo viên chủ nhiệm là bắt buộc!" : ""),
        specializationId: (value) => (!isRequired(value) ? "Chuyên ngành là bắt buộc!" : ""),
        className: () => "",
        size: () => "",
        classType: () => "",
        registrationStatus: () => "",
        subjectId: () => "",
        teacherName: () => "",
        specializationName: () => "",
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
                mode === "add" ? "Thêm lớp thành công!" : "Cập nhật lớp thành công!",
                "success"
            );

            setConfirm({ ...confirm, save: false, pendingPayload: null });
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
                {mode === "add" ? "ADD CLASS" : "EDIT CLASS"}
            </DialogTitle>

            <DialogContent className="primary-dialog-content">
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <LabelPrimary value="Mã lớp" required />
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
                        <LabelPrimary value="Tên lớp" />
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
                        <LabelPrimary value="Sĩ số" />
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
                        <LabelPrimary value="Loại lớp" />
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
                        <LabelPrimary value="Trạng thái đăng ký" />
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
                        <LabelPrimary value="Môn học" />
                        <MainAutocomplete
                            options={subjectOptions}
                            value={
                                formValues.subjectId
                                    ? subjectOptions.find(
                                          (subject) => subject.id.toString() === formValues.subjectId
                                      ) ?? null
                                    : null
                            }
                            onChange={(id) =>
                                setFormValues((prev) => ({ ...prev, subjectId: id }))
                            }
                            onSearchChange={setSearchSubject}
                            onResetPage={() => setSubjectPage(1)}
                            getOptionLabel={(option) =>
                                option.subject_code
                                    ? `${option.subject_code} - ${option.name}`
                                    : option.name
                            }
                            getOptionId={(option) => option.id?.toString() || ""}
                            className="primary-dialog-input"
                            placeholder="Chọn môn học"
                        />
                    </Grid>

                    <Grid size={6}>
                        <LabelPrimary value="Chuyên Ngành" required />
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
                        <LabelPrimary value="Giáo viên chủ nhiệm" required />
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
                open={confirm.save}
                title="Xác nhận lưu"
                message="Bạn có chắc muốn lưu các thay đổi?"
                onConfirm={() => confirm.pendingPayload && handleConfirmSave(confirm.pendingPayload)}
                onCancel={() => setConfirm({ ...confirm, save: false })}
            />
        </Dialog>
    );
};

export default ClassForm;
