import { Grid, TextField, Typography, Select, MenuItem } from "@mui/material";
import React from "react";
import LabelPrimary from "../../../components/Label/Label";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { IStudentRelative } from "../types";

interface RelativeInformationTabProps {
    relatives: IStudentRelative[];
    onRelativeChange: (index: number, fields: Partial<IStudentRelative>) => void;
}

const SECTION_TITLES = ["THÔNG TIN CỦA CHA", "THÔNG TIN CỦA MẸ", "THÔNG TIN CỦA NGƯỜI THÂN"];

const RelativeInformationTab: React.FC<RelativeInformationTabProps> = ({ relatives, onRelativeChange }) => {
    const handleFieldChange = (
        index: number,
        field: keyof IStudentRelative,
        value: string | null,
    ) => {
        onRelativeChange(index, { [field]: value });
    };

    return (
        <Grid container spacing={2} className="myprofile-form">
            {relatives.map((relative, index) => {
                const relativeDob = relative.date_of_birth ? new Date(relative.date_of_birth) : null;
                return (
                    <React.Fragment key={`relative-${index}`}>
                        <Grid size={12}>
                            <Typography className="myprofile-panel__title">
                                {SECTION_TITLES[index] ?? `THÔNG TIN NGƯỜI THÂN ${index + 1}`}
                            </Typography>
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Họ và tên người thân" />
                            <TextField
                                value={relative.name ?? ""}
                                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            />
                        </Grid>

                        <Grid size={4} className="">
                            {/* <LabelPrimary value="Quan hệ" />
                            <Select
                                value={relative.relationship ?? ""}
                                onChange={(e) => handleFieldChange(index, "relationship", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            >
                                {RELATIONSHIP_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select> */}
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Ngày sinh" />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    value={relativeDob}
                                    onChange={(newValue) =>
                                        handleFieldChange(
                                            index,
                                            "date_of_birth",
                                            newValue ? newValue.toISOString() : null,
                                        )
                                    }
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Nghề nghiệp" />
                            <TextField
                                value={relative.occupation ?? ""}
                                onChange={(e) => handleFieldChange(index, "occupation", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            />
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Số điện thoại" />
                            <TextField
                                value={relative.phone ?? ""}
                                onChange={(e) => handleFieldChange(index, "phone", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            />
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Địa chỉ" />
                            <TextField
                                value={relative.address ?? ""}
                                onChange={(e) => handleFieldChange(index, "address", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            />
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Dân tộc" />
                            <TextField
                                value={relative.ethnicity ?? ""}
                                onChange={(e) => handleFieldChange(index, "ethnicity", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            />
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Tôn giáo" />
                            <TextField
                                value={relative.religion ?? ""}
                                onChange={(e) => handleFieldChange(index, "religion", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            />
                        </Grid>

                        <Grid size={4} className="">
                            <LabelPrimary value="Quốc tịch" />
                            <TextField
                                value={relative.nationality ?? ""}
                                onChange={(e) => handleFieldChange(index, "nationality", e.target.value)}
                                fullWidth
                                variant="outlined"
                                className="main-text__field"
                            />
                        </Grid>
                    </React.Fragment>
                );
            })}
        </Grid>
    );
};

export default RelativeInformationTab;
