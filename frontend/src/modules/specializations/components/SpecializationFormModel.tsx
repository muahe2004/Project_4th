import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import dayjs from "dayjs";
import { STATUS } from "../../../constants/status";
import type { ISpecializations } from "../types";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { useGetDepartment } from "../../department/apis/getDepartments";
import { hasObjectChanged } from "../../../utils/checkChangeValues";
import { useCreateSpecialization } from "../apis/addSpecialization";
import { useEditSpecialization } from "../apis/editSpecialization";
import { useGetMajor } from "../../majors/apis/getMajors";

interface SpecializationsFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: ISpecializations;
    onClose: () => void;
}

const SpecializationForm: React.FC<SpecializationsFormProps> = ({ open, mode, initialValues, onClose }) => {
    const ID = initialValues?.id;
    const { showSnackbar } = useSnackbar();
    
    const [specializationCode, setSpecializationCode] = useState("");
    const [specializationName, setSpecializationName] = useState("");
    const [establishedDate, setEstablishedDate] = useState<Date | null>(new Date());
    const [description, setDescription] = useState(""); 
    const [majorId, setMajorId] = useState("");
    const [openConfirmSave, setOpenConfirmSave] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<ISpecializations | null>(null);
    const [searchDepartMent, setSearchDepartMent] = useState("");

    const currentValues: ISpecializations = {
        specialization_code: specializationCode.trim(),
        name: specializationName.trim(),
        established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
        status: STATUS.ACTIVE,
        description: description.trim(),
        major_id: majorId,
        ...(mode === "edit" ? { updated_at: dayjs().format("YYYY-MM-DD") } : {}),
    };

    const Params = {
        limit: 5,
        skip: 0,
        search: searchDepartMent || undefined
    };

    const { data: major, isLoading: isLoadingMajor, error: errorMajor } = useGetMajor(Params);
    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({mode, isChanged, onClose});
    const { mutateAsync: createSpecialization } = useCreateSpecialization({});
    const { mutateAsync: editSpecialization } = useEditSpecialization({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setSpecializationCode(initialValues.specialization_code || "");
            setSpecializationName(initialValues.name || "");
            setEstablishedDate(
                initialValues.established_date
                ? new Date(initialValues.established_date)
                : null
            );
            setMajorId(initialValues.major_id || "");
            setDescription(initialValues.description || "");
        } else {
            setSpecializationCode("");
            setSpecializationName("");
            setEstablishedDate(new Date());
            setDescription("");
            setMajorId("");
        }
    }, [mode, initialValues, open]);

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            const payload: ISpecializations = {
                specialization_code: specializationCode.trim(),
                name: specializationName.trim(),
                established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
                status: STATUS.ACTIVE,
                description: description.trim(),
                updated_at: dayjs().format("YYYY-MM-DD"),
                major_id: majorId
            };

            const hasChanges = hasObjectChanged(payload, initialValues, ["established_date"], ["updated_at"]);
            setIsChanged(hasChanges);
        } else {
            const hasInput =
                currentValues.major_id !== "" ||
                currentValues.description !== "" ||
                currentValues.established_date !== dayjs(new Date()).format("YYYY-MM-DD") ||
                currentValues.specialization_code !== "" ||
                currentValues.name !== "" ||
                currentValues.status !== STATUS.ACTIVE;

            setIsChanged(hasInput);
        }
    }, [specializationCode, specializationName, establishedDate, description, majorId, mode, initialValues]);

    const handleSubmitClick = () => {
        const payload = currentValues;

        if (mode === "edit" && initialValues) {
            const hasChanges = hasObjectChanged(payload, initialValues, ["established_date"], ["updated_at"]);

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

    const handleConfirmSave = async (payload: ISpecializations) => {
        try {
            if (mode === "add") await createSpecialization(payload);
            else if (mode === "edit" && ID) await editSpecialization({ id: ID, data: payload });

            showSnackbar(
                mode === "add" ? "Thêm chuyên ngành thành công!" : "Cập nhật chuyên ngành thành công!",
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
                {mode === "add" ? "ADD SPECIALIZATION" : "EDIT SPECIALIZATION"}
            </DialogTitle>
            <DialogContent className="primary-dialog-content">
                <LabelPrimary value="Mã chuyên ngành" required />
                <TextField
                    value={specializationCode}
                    onChange={(e) => setSpecializationCode(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                />

                <LabelPrimary value="Tên chuyên ngành" required />
                <TextField
                    value={specializationName}
                    onChange={(e) => setSpecializationName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                />

                <LabelPrimary value="Ngày thành lập" />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={establishedDate ? new Date(establishedDate) : null}
                        onChange={(newValue) => setEstablishedDate(newValue)}
                        className="main-text__field primary-dialog-input"
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </LocalizationProvider>

                <LabelPrimary value="Ngành" required />
                <Select
                    value={majorId}
                    onChange={(e) => setMajorId(e.target.value)}
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

                <LabelPrimary value="Mô tả" />
                <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    className="main-text__field"
                />
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

export default SpecializationForm;