import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";

import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";

import { useConfirmCloseForm } from "../../../hooks/useConfirm";

import { useCreateClass } from "../apis/addClass";
import { useEditClass } from "../apis/editClass";
import { useTeacherDropdown } from "../../teachers/apis/getTeacherDropDown";
import { useSpecializationsDropDown } from "../../specializations/apis/getSpecializationDropDown";

import { hasObjectChanged } from "../../../utils/checkChangeValues";
import { positiveIntegerSlotProps } from "../../../utils/validation/validations";
import { STATUS } from "../../../constants/status";
import type { IClasses, IClassesResponse } from "../types";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";

interface ClassFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IClassesResponse;
    onClose: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ open, mode, initialValues, onClose }) => {
    const { showSnackbar } = useSnackbar();
    const ID = initialValues?.id;

    const [classCode, setClassCode] = useState("");
    const [className, setClassName] = useState("");
    const [size, setSize] = useState(0);

    const [teacherId, setTeacherId] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const [specializationId, setSpecializationId] = useState("");
    const [specializationName, setSpecializationName] = useState("");

    const [openConfirmSave, setOpenConfirmSave] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<IClasses | null>(null);

    const [teacherPage, setTeacherPage] = useState(1);
    const [specializationPage, setSpecializationPage] = useState(1);

    const [searchTeacher, setSearchTeacher] = useState("");
    const [searchSpecialization, setSearchSpecialization] = useState("");

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

    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
        mode,
        isChanged,
        onClose,
    });

    const { mutateAsync: createClass } = useCreateClass({});
    const { mutateAsync: editClass } = useEditClass({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setClassCode(initialValues.class_code || "");
            setClassName(initialValues.class_name || "");
            setSize(initialValues.size || 0);
            setTeacherId(initialValues.teacher_id || "");
            setTeacherName(initialValues.teacher_name || "");
            setSpecializationId(initialValues.specialization_id || "");
            setSpecializationName(initialValues.specialization_name || "");
        } else {
            setClassCode("");
            setClassName("");
            setSize(0);
            setTeacherId("");
            setTeacherName("");
            setSpecializationId("");
            setSpecializationName("");
        }
    }, [mode, initialValues, open]);

    useEffect(() => {
        const payload: IClasses = {
            class_code: classCode.trim(),
            class_name: className.trim(),
            status: STATUS.ACTIVE,
            size,
            specialization_id: specializationId,
            teacher_id: teacherId,
            ...(mode === "edit" ? { updated_at: dayjs().format("YYYY-MM-DD") } : {}),
        };

        if (mode === "edit" && initialValues) {
            const hasChanges = hasObjectChanged(payload, initialValues, [], ["updated_at"]);
            setIsChanged(hasChanges);
        } else {
            const hasInput =
                classCode.trim() !== "" ||
                className.trim() !== "" ||
                size !== 0 ||
                teacherId !== "" ||
                specializationId !== "";
            setIsChanged(hasInput);
        }
    }, [classCode, className, size, teacherId, specializationId, mode, initialValues]);

    const handleSubmitClick = () => {
        const payload: IClasses = {
            class_code: classCode.trim(),
            class_name: className.trim(),
            status: STATUS.ACTIVE,
            teacher_id: teacherId,
            specialization_id: specializationId,
            size,
            ...(mode === "edit" ? { updated_at: dayjs().format("YYYY-MM-DD") } : {}),
        };

        if (mode === "edit" && initialValues) {
            const hasChanges = hasObjectChanged(payload, initialValues, [], ["updated_at"]);
            if (!hasChanges) {
                setOpenConfirm(false);
                return;
            }
            setPendingPayload(payload);
            setOpenConfirmSave(true);
        } else {
            handleConfirmSave(payload);
        }
    };

    const handleConfirmSave = async (payload: IClasses) => {
        try {
            if (mode === "add") await createClass(payload);
            else if (mode === "edit" && ID) await editClass({ id: ID, data: payload });

            showSnackbar(mode === "add" ? "Thêm lớp thành công!" : "Cập nhật lớp thành công!", "success");

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
            {mode === "add" ? "ADD CLASS" : "EDIT CLASS"}
        </DialogTitle>

        <DialogContent className="primary-dialog-content">
            <LabelPrimary value="Mã lớp" required />
            <TextField
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                fullWidth
                variant="outlined"
                className="main-text__field primary-dialog-input"
            />

            <LabelPrimary value="Tên lớp" />
            <TextField
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                fullWidth
                variant="outlined"
                className="main-text__field primary-dialog-input"
            />

            <LabelPrimary value="Sĩ số" />
            <TextField
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                fullWidth
                variant="outlined"
                className="main-text__field primary-dialog-input"
                slotProps={positiveIntegerSlotProps}
            />

            <LabelPrimary value="Chuyên Ngành" required />
            <MainAutocomplete
                options={specializations}
                value={
                    specializationId
                    ? { id: specializationId, name: specializationName }
                    : null
                }
                onChange={(id) => {
                    setSpecializationId(id);
                    const selected = specializations.find((s) => s.id.toString() === id);
                    setSpecializationName(selected?.name || "");
                }}
                onSearchChange={setSearchSpecialization}
                onResetPage={() => setSpecializationPage(1)}
                getOptionLabel={(option) => option.name}
                getOptionId={(option) => option.id?.toString() || ""}
                className="primary-dialog-input"
            />

            <LabelPrimary value="Giáo viên chủ nhiệm" required />
            <MainAutocomplete
                options={teacher}
                value={
                    teacherId
                    ? { id: teacherId, name: teacherName }
                    : null
                }
                onChange={(id) => {
                    setTeacherId(id);
                    const selected = teacher.find((t) => t.id.toString() === id);
                    setTeacherName(selected?.name || "");
                }}
                onSearchChange={setSearchTeacher}
                onResetPage={() => setTeacherPage(1)}
                getOptionLabel={(option) => option.name}
                getOptionId={(option) => option.id?.toString() || ""}
                className="primary-dialog-input"
            />
        </DialogContent>

        <DialogActions className="primary-dialog-actions">
            <Button onClick={handleCloseClick} className="button-cancel">
                Hủy
            </Button>
            <Button
                onClick={handleSubmitClick}
                variant="contained"
                disabled={!isChanged}
            >
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
            onConfirm={() => pendingPayload && handleConfirmSave(pendingPayload)}
            onCancel={() => setOpenConfirmSave(false)}
        />
        </Dialog>
    );
};

export default ClassForm;