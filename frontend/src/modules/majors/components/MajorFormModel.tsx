import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import React, { useMemo, useState, useEffect } from "react";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import dayjs from "dayjs";
import { STATUS } from "../../../constants/status";
import type { IMajors } from "../types";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { useDepartmentsDropDown } from "../../department/apis/getDepartmentsDropDown";
import { useDepartmentsDropDownByIds } from "../../department/apis/getDepartmentsDropDownByIds";
import { useCreateMajor } from "../apis/addMajor";
import { useEditMajor } from "../apis/editMajor";
import { hasObjectChanged } from "../../../utils/checkChangeValues";
import type { IDepartmentsDropDown } from "../../department/types";
import { useTranslation } from "react-i18next";

interface MajorFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IMajors;
    onClose: () => void;
}

const MajorForm: React.FC<MajorFormProps> = ({ open, mode, initialValues, onClose }) => {
    const { t } = useTranslation();
    const ID = initialValues?.id;
    const { showSnackbar } = useSnackbar();
    
    const [majorCode, setMajorCode] = useState("");
    const [majorName, setMajorName] = useState("");
    const [establishedDate, setEstablishedDate] = useState<Date | null>(new Date());
    const [description, setDescription] = useState(""); 
    const [departmentId, setDepartmentId] = useState("");
    const [openConfirmSave, setOpenConfirmSave] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<IMajors | null>(null);
    const [searchDepartment, setSearchDepartment] = useState("");

    const currentValues: IMajors = {
        major_code: majorCode.trim(),
        name: majorName.trim(),
        established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
        status: STATUS.ACTIVE,
        description: description.trim(),
        department_id: departmentId,
        ...(mode === "edit" ? { updated_at: dayjs().format("YYYY-MM-DD") } : {}),
    };

    const departmentParams = {
        limit: 10,
        skip: 0,
        status: STATUS.ACTIVE,
        search: searchDepartment || undefined
    };

    const { data: departmentOptions = [] } = useDepartmentsDropDown(departmentParams);
    const { data: selectedDepartmentOptions = [] } = useDepartmentsDropDownByIds(
        departmentId ? { ids: [departmentId] } : { ids: [] }
    );
    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({mode, isChanged, onClose});
    const { mutateAsync: createMajor } = useCreateMajor({});
    const { mutateAsync: editMajor } = useEditMajor({});

    const autocompleteDepartmentOptions = useMemo(() => {
        const merged = [...selectedDepartmentOptions, ...departmentOptions];
        return Array.from(new Map(merged.map((item) => [item.id, item])).values());
    }, [selectedDepartmentOptions, departmentOptions]);

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setMajorCode(initialValues.major_code || "");
            setMajorName(initialValues.name || "");
            setEstablishedDate(
                initialValues.established_date
                ? new Date(initialValues.established_date)
                : null
            );
            setDepartmentId(initialValues.department_id || "");
            setDescription(initialValues.description || "");
        } else {
            setMajorCode("");
            setMajorName("");
            setEstablishedDate(new Date());
            setDescription("");
            setDepartmentId("");
        }
    }, [mode, initialValues, open]);

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            const payload: IMajors = {
                major_code: majorCode.trim(),
                name: majorName.trim(),
                established_date: dayjs(establishedDate).format("YYYY-MM-DD"),
                status: STATUS.ACTIVE,
                description: description.trim(),
                updated_at: dayjs().format("YYYY-MM-DD"),
                department_id: departmentId
            };

            const hasChanges = hasObjectChanged(payload, initialValues, ["established_date"], ["updated_at"]);
            setIsChanged(hasChanges);
        } else {
            const hasInput =
                currentValues.department_id !== "" ||
                currentValues.description !== "" ||
                currentValues.established_date !== dayjs(new Date()).format("YYYY-MM-DD") ||
                currentValues.major_code !== "" ||
                currentValues.name !== "" ||
                currentValues.status !== STATUS.ACTIVE;

            setIsChanged(hasInput);
        }
    }, [majorCode, majorName, establishedDate, description, departmentId, mode, initialValues]);

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

    const handleConfirmSave = async (payload: IMajors) => {
        try {
            if (mode === "add") await createMajor(payload);
            else if (mode === "edit" && ID) await editMajor({ id: ID, data: payload });

            showSnackbar(
                mode === "add" ? t("majors.messages.addSuccess") : t("majors.messages.updateSuccess"),
                "success"
            );

            setOpenConfirmSave(false);
            onClose();
        } catch (error) {
            console.error(error);
            showSnackbar(t("majors.messages.genericError"), "error");
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseClick} className="primary-dialog department-form" maxWidth="sm" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? t("majors.form.titleAdd") : t("majors.form.titleEdit")}
            </DialogTitle>
            <DialogContent className="primary-dialog-content">
                <LabelPrimary value={t("majors.form.labels.majorCode")} required />
                <TextField
                    value={majorCode}
                    onChange={(e) => setMajorCode(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                />

                <LabelPrimary value={t("majors.form.labels.majorName")} required />
                <TextField
                    value={majorName}
                    onChange={(e) => setMajorName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field primary-dialog-input"
                />

                <LabelPrimary value={t("majors.form.labels.establishedDate")} />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={establishedDate ? new Date(establishedDate) : null}
                        onChange={(newValue) => setEstablishedDate(newValue)}
                        className="main-text__field primary-dialog-input"
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </LocalizationProvider>

                <LabelPrimary value={t("majors.form.labels.department")} required />
                <MainAutocomplete
                    options={autocompleteDepartmentOptions}
                    value={departmentId}
                    onChange={setDepartmentId}
                    onSearchChange={setSearchDepartment}
                    getOptionLabel={(option) => `${option.department_name} (${option.department_code})`}
                    getOptionId={(option) => option.id.toString()}
                    placeholder={t("majors.form.departmentPlaceholder")}
                />

                <LabelPrimary value={t("majors.form.labels.description")} />
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
                <Button onClick={handleCloseClick} className="button-cancel">
                    {t("majors.common.cancel")}
                </Button>
                <Button onClick={handleSubmitClick} variant="contained" disabled={!isChanged}>
                    {mode === "add" ? t("majors.common.add") : t("majors.common.save")}
                </Button>
            </DialogActions>

            <ConfirmDialog
                open={openConfirm}
                title={t("majors.confirm.exitTitle")}
                message={t("majors.confirm.exitMessage")}
                onConfirm={() => {
                    setOpenConfirm(false);
                    onClose();
                }}
                onCancel={() => setOpenConfirm(false)}
            />

            <ConfirmDialog
                open={openConfirmSave}
                title={t("majors.confirm.saveTitle")}
                message={t("majors.confirm.saveMessage")}
                onConfirm={() => pendingPayload && handleConfirmSave(pendingPayload)}
                onCancel={() => setOpenConfirmSave(false)}
            />
        </Dialog>
    );
};

export default MajorForm;
