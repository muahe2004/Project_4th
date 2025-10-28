import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import dayjs from "dayjs";
import { STATUS } from "../../../constants/status";
import type { IClasses } from "../types";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { hasObjectChanged } from "../../../utils/checkChangeValues";
import { useCreateClass } from "../apis/addClass";
import { useEditClass } from "../apis/editClass";
import { useGetMajor } from "../../majors/apis/getMajors";

interface ClasssFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IClasses;
    onClose: () => void;
}

const ClassForm: React.FC<ClasssFormProps> = ({ open, mode, initialValues, onClose }) => {
    const ID = initialValues?.id;
    const { showSnackbar } = useSnackbar();
    
    const [classCode, setClassCode] = useState("");
    const [className, setClassName] = useState("");
    const [size, setSize] = useState(0);
    // const [establishedDate, setEstablishedDate] = useState<Date | null>(new Date());
    // const [description, setDescription] = useState(""); 
    const [teacherId, setTeacherId] = useState("");
    const [specializationId, setSpecializationId] = useState("");
    const [openConfirmSave, setOpenConfirmSave] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<IClasses | null>(null);
    const [searchDepartMent, setSearchDepartMent] = useState("");

    const currentValues: IClasses = {
        class_code: classCode.trim(),
        class_name: className.trim(),
        status: STATUS.ACTIVE,
        teacher_id: teacherId,
        specialization_id: specializationId,
        size: size,
        ...(mode === "edit" ? { updated_at: dayjs().format("YYYY-MM-DD") } : {}),
    };

    const Params = {
        limit: 5,
        skip: 0,
        search: searchDepartMent || undefined
    };

    const { data: major, isLoading: isLoadingMajor, error: errorMajor } = useGetMajor(Params);
    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({mode, isChanged, onClose});
    const { mutateAsync: createClass } = useCreateClass({});
    const { mutateAsync: editClass } = useEditClass({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setClassCode(initialValues.class_code || "");
            setClassName(initialValues.class_name || "");
            setSpecializationId(initialValues.specialization_id || "");
            setTeacherId(initialValues.teacher_id || "");
            setSize(initialValues.size || 0);
        } else {
            setClassCode("");
            setClassName("");
            setSpecializationId("");
            setTeacherId("");
            // setSize(0);
        }
    }, [mode, initialValues, open]);

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            const payload: IClasses = {
                class_code: classCode.trim(),
                class_name: className.trim(),
                status: STATUS.ACTIVE,
                size: size,
                updated_at: dayjs().format("YYYY-MM-DD"),
                specialization_id: specializationId,
                teacher_id: teacherId
            };

            const hasChanges = hasObjectChanged(payload, initialValues, [], ["updated_at"]);
            setIsChanged(hasChanges);
        } else {
            const hasInput =
                currentValues.specialization_id !== "" ||
                currentValues.teacher_id !== "" ||
                currentValues.size !== 0 ||
                currentValues.class_code !== "" ||
                currentValues.class_name !== "" ||
                currentValues.status !== STATUS.ACTIVE;

            setIsChanged(hasInput);
        }
    }, [classCode, className, size, teacherId, specializationId, mode, initialValues]);

    const handleSubmitClick = () => {
        const payload = currentValues;

        if (mode === "edit" && initialValues) {
            const hasChanges = hasObjectChanged(payload, initialValues, [], ["updated_at"]);

            if (!hasChanges) {
                setOpenConfirm(false);
                return;
            } else {
                setPendingPayload(payload);
                setOpenConfirmSave(true); 
            }
        } else {
            handleConfirmSave(payload);
        }
    };

    const handleConfirmSave = async (payload: IClasses) => {
        try {
            if (mode === "add") await createClass(payload);
            else if (mode === "edit" && ID) await editClass({ id: ID, data: payload });

            showSnackbar(
                mode === "add" ? "Thêm lớp thành công!" : "Cập nhật lớp thành công!",
                "success"
            );

            setOpenConfirmSave(false);
            onClose();
        } catch (error) {
            console.error(error);
            showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseClick} className="primary-dialog department-form" maxWidth="sm" fullWidth>
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

                <LabelPrimary value="Chuyên Ngành" required />
                <Select
                    value={specializationId}
                    onChange={(e) => setSpecializationId(e.target.value)}
                    fullWidth
                    id="outlined-select"
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                    MenuProps={{
                        disableScrollLock: true,   
                    }}
                >
                    {
                        major?.data.map((row) => (
                            <MenuItem key={row.id} value={row.id}>{row.name}</MenuItem>
                        ))
                    }
                </Select>

                <LabelPrimary value="Giáo viên chủ nhiệm" />
                <Select
                    value={specializationId}
                    onChange={(e) => setSpecializationId(e.target.value)}
                    fullWidth
                    id="outlined-select"
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                    MenuProps={{
                        disableScrollLock: true,   
                    }}
                >
                    {
                        major?.data.map((row) => (
                            <MenuItem key={row.id} value={row.id}>{row.name}</MenuItem>
                        ))
                    }
                </Select>

                {/* <LabelPrimary value="Mô tả" />
                <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    className="main-text__field"
                /> */}
            </DialogContent>
            <DialogActions className="primary-dialog-actions">
                <Button onClick={handleCloseClick} className="button-cancel">Hủy</Button>
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
                onConfirm={() => pendingPayload && handleConfirmSave(pendingPayload)}
                onCancel={() => setOpenConfirmSave(false)}
            />
        </Dialog>
    );
};

export default ClassForm;