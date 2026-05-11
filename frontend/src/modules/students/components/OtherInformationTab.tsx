// bank_account_number
// : 
// "string"
// bank_name
// : 
// "string"
// citizen_id
// : 
// null
// created_at
// : 
// "2026-01-18T14:49:36.502040"
// ethnicity
// : 
// "string"
// exempted_group
// : 
// "string"
// id
// : 
// "dee22dd3-145f-48d8-9b07-4645e2f092b9"
// insurance_number
// : 
// "string"
// issue_date
// : 
// "2026-01-18T07:42:09.830000"
// issue_place
// : 
// "string"
// nationality
// : 
// "string"
// place_of_origin
// : 
// "string"
// priority_group
// : 
// "string"
// religion
// : 
// "string"
// student_id
// : 
// "981a4e60-15eb-4de0-b446-e0b13988d1cd"
// teacher_id
// : 
// null
// updated_at
// : 
// "2026-01-18T14:49:36.502103"

import { Grid, TextField } from "@mui/material";
import React from "react";
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { IStudentsResponse, IStudentInformation } from "../types";
import { useTranslation } from "react-i18next";

interface OtherInformationTabProps {
    student: IStudentsResponse;
    onStudentChange: React.Dispatch<React.SetStateAction<IStudentsResponse>>;
}

const normalizeInput = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const OtherInformationTab: React.FC<OtherInformationTabProps> = ({ student, onStudentChange }) => {
    const { t } = useTranslation();
    const studentInfo = (student.student_information || {}) as IStudentInformation;

    const updateStudentInfo = (field: keyof IStudentInformation, value: string | null) => {
        onStudentChange((prev) => ({
            ...prev,
            student_information: {
                ...(prev.student_information || {}),
                [field]: value,
            },
        }));
    };

    const issueDateValue = studentInfo.issue_date ? new Date(studentInfo.issue_date) : null;

    return (
        <Grid container spacing={2} className="myprofile-form">
            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.placeOfOrigin")} />
                    <TextField
                        value={studentInfo.place_of_origin ?? ""}
                        onChange={(e) => updateStudentInfo("place_of_origin", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.exemptedGroup")} />
                    <TextField
                        value={studentInfo.exempted_group ?? ""}
                        onChange={(e) => updateStudentInfo("exempted_group", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.priorityGroup")} />
                    <TextField
                        value={studentInfo.priority_group ?? ""}
                        onChange={(e) => updateStudentInfo("priority_group", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.citizenId")} />
                    <TextField
                        value={studentInfo.citizen_id ?? ""}
                        onChange={(e) => updateStudentInfo("citizen_id", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.issueDate")} />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={issueDateValue}
                        onChange={(newValue) =>
                            updateStudentInfo("issue_date", newValue ? newValue.toISOString() : null)
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </LocalizationProvider>
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.issuePlace")} />
                    <TextField
                        value={studentInfo.issue_place ?? ""}
                        onChange={(e) => updateStudentInfo("issue_place", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.nationality")} />
                    <TextField
                        value={studentInfo.nationality ?? ""}
                        onChange={(e) => updateStudentInfo("nationality", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.ethnicity")} />
                    <TextField
                        value={studentInfo.ethnicity ?? ""}
                        onChange={(e) => updateStudentInfo("ethnicity", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.religion")} />
                    <TextField
                        value={studentInfo.religion ?? ""}
                        onChange={(e) => updateStudentInfo("religion", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.insuranceNumber")} />
                    <TextField
                        value={studentInfo.insurance_number ?? ""}
                        onChange={(e) => updateStudentInfo("insurance_number", normalizeInput(e.target.value))}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            {/* <Grid size={4} className="">
                <LabelPrimary value="Mã sinh viên" />
                <TextField
                    value={studentInfo.student_id ?? ""}
                    onChange={(e) => updateStudentInfo("student_id", e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid> */}

            {/* <Grid size={4} className="">
                <LabelPrimary value="Mã giáo viên" />
                <TextField
                    value={studentInfo.teacher_id ?? ""}
                    onChange={(e) => updateStudentInfo("teacher_id", e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid> */}

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.bankName")} />
                <TextField
                    value={studentInfo.bank_name ?? ""}
                    onChange={(e) => updateStudentInfo("bank_name", e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>

            <Grid size={4} className="">
                <LabelPrimary value={t("students.other.bankAccountNumber")} />
                <TextField
                    value={studentInfo.bank_account_number ?? ""}
                    onChange={(e) => updateStudentInfo("bank_account_number", e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="main-text__field"
                />
            </Grid>
        </Grid>
    );
};

export default OtherInformationTab;
