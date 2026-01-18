import { Grid, TextField, Select, MenuItem } from "@mui/material";
import React from "react";
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { IStudentsResponse } from "../types";
import type { IClassesDropDown } from "../../classes/types";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";

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
    <Grid container spacing={2} className="myprofile-form">
        <Grid size={4} className="">
            <LabelPrimary value="Mã sinh viên" required />
            <TextField
                value={student.student_code}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, student_code: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Họ và tên" required />
            <TextField
                value={student.name}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, name: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Sinh nhật" />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    value={dateOfBirth}
                    onChange={onDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </LocalizationProvider>
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Giới tính" required />
            <Select
                value={student.gender}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, gender: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            >
                <MenuItem value="1">Nam</MenuItem>
                <MenuItem value="2">Nữ</MenuItem>
                <MenuItem value="3">Khác</MenuItem>
            </Select>
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Email" required />
            <TextField
                value={student.email}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, email: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Số điện thoại" required />
            <TextField
                value={student.phone}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, phone: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={12} className="">
            <LabelPrimary value="Địa chỉ" required />
            <TextField
                value={student.address ?? ""}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, address: e.target.value }))}
                fullWidth
                variant="outlined"
                className="main-text__field"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Lớp" required />
            <MainAutocomplete
                options={classes}
                value={student.class_id ? classes.find((cls) => cls.id === student.class_id) ?? null : null}
                onChange={(id) => onStudentChange((prev) => ({ ...prev, class_id: id || "" }))}
                onSearchChange={onClassSearchChange}
                onResetPage={onClassResetPage}
                getOptionLabel={(option) => `${option.class_code} - ${option.class_name}`}
                getOptionId={(option) => option.id}
                placeholder="Chọn lớp"
            />
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Chương trình đào tạo" required />
            <Select
                value={student.training_program ?? ""}
                onChange={(e) => onStudentChange((prev) => ({ ...prev, training_program: e.target.value }))}
                fullWidth
                className="main-text__field"
            >
                <MenuItem value="1">Đại học chính quy</MenuItem>
                <MenuItem value="2">Liên thông</MenuItem>
                <MenuItem value="3">Văn bằng hai</MenuItem>
            </Select>
        </Grid>

        <Grid size={4} className="">
            <LabelPrimary value="Niên khoá" required />
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

export default BasicInformationTab;
