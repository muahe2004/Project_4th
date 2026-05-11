import { Grid, TextField, Select, MenuItem } from "@mui/material";
import React from "react";
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { IStudentsResponse } from "../types";
import type { IClassesDropDown } from "../../classes/types";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { useTranslation } from "react-i18next";

interface BasicInformationTabProps {
    student: IStudentsResponse;
    classes: IClassesDropDown[];
    dateOfBirth: Date | null;
    onStudentChange: React.Dispatch<React.SetStateAction<IStudentsResponse>>;
    onDateChange: (value: Date | null) => void;
    onClassSearchChange: (search: string) => void;
    onClassResetPage: () => void;
}

const BasicInformationTab: React.FC<BasicInformationTabProps> = ({
    student,
    classes,
    dateOfBirth,
    onStudentChange,
    onDateChange,
    onClassSearchChange,
    onClassResetPage,
}) => (
    <BasicInformationTabContent
        student={student}
        classes={classes}
        dateOfBirth={dateOfBirth}
        onStudentChange={onStudentChange}
        onDateChange={onDateChange}
        onClassSearchChange={onClassSearchChange}
        onClassResetPage={onClassResetPage}
    />
);

const BasicInformationTabContent: React.FC<BasicInformationTabProps> = ({
    student,
    classes,
    dateOfBirth,
    onStudentChange,
    onDateChange,
    onClassSearchChange,
    onClassResetPage,
}) => {
    const { t } = useTranslation();

    return (
    <Grid container spacing={2} className="myprofile-form">
        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.studentCode")} required />
            <TextField
                value={student.student_code}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, student_code: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.studentName")} required />
            <TextField
                value={student.name}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, name: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.dateOfBirth")} />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    value={dateOfBirth}
                    onChange={onDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </LocalizationProvider>
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.gender")} required />
            <Select
                value={student.gender}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, gender: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            >
                <MenuItem value="1">{t("students.gender.male")}</MenuItem>
                <MenuItem value="2">{t("students.gender.female")}</MenuItem>
                <MenuItem value="3">{t("students.gender.other")}</MenuItem>
            </Select>
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.email")} required />
            <TextField
                value={student.email}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, email: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.phone")} required />
            <TextField
                value={student.phone}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, phone: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={12} className="">
            <LabelPrimary value={t("students.form.address")} required />
            <TextField
                value={student.address ?? ""}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, address: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.class")} required />
            <MainAutocomplete
                options={classes}
                value={
                    student.class_id
                        ? classes.find((cls) => cls.id === student.class_id) ??
                          (student.class_name || student.class_code
                              ? {
                                    id: student.class_id,
                                    class_code: student.class_code ?? "",
                                    class_name: student.class_name ?? "",
                                }
                              : null)
                        : null
                }
                onChange={(id) =>
                    onStudentChange((prev) => {
                        const selectedClass = classes.find((cls) => cls.id === id);
                        return {
                            ...prev,
                            class_id: id || undefined,
                            class_name: selectedClass?.class_name ?? "",
                            class_code: selectedClass?.class_code ?? "",
                        };
                    })
                }
                onSearchChange={onClassSearchChange}
                onResetPage={onClassResetPage}
                getOptionLabel={(option) => `${option.class_code} - ${option.class_name}`}
                getOptionId={(option) => option.id}
                placeholder={t("students.form.selectClass")}
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.trainingProgram")} required />
            <Select
                value={student.training_program ?? ""}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, training_program: e.target.value }))}
                fullWidth
                className="main-text__field"
            >
                <MenuItem value="1">{t("students.trainingProgram.fullTime")}</MenuItem>
                <MenuItem value="2">{t("students.trainingProgram.transfer")}</MenuItem>
                <MenuItem value="3">{t("students.trainingProgram.secondDegree")}</MenuItem>
            </Select>
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value={t("students.form.course")} required />
            <Select
                value={student.course ?? ""}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, course: e.target.value }))}
                fullWidth
                className="main-text__field"
            >
                <MenuItem value="1">2022–2026</MenuItem>
                <MenuItem value="2">2021–2025</MenuItem>
            </Select>
        </Grid>
    </Grid>
    );
};

export default BasicInformationTab;
