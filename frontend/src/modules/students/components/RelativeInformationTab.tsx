import { Box, Grid, TextField, Typography } from "@mui/material";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";

import LabelPrimary from "../../../components/Label/Label";
import type { IStudentRelative } from "../types";

interface RelativeInformationTabProps {
  relatives: IStudentRelative[];
  onRelativeChange: (index: number, fields: Partial<IStudentRelative>) => void;
}

const RELATIVE_SECTION_KEYS = ["father", "mother", "relative"] as const;

const RelativeInformationTab: React.FC<RelativeInformationTabProps> = ({ relatives, onRelativeChange }) => {
  const { t } = useTranslation();

  const handleFieldChange = (
    index: number,
    field: keyof IStudentRelative,
    value: string | null
  ) => {
    onRelativeChange(index, { [field]: value });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {relatives.map((relative, index) => {
        const relativeDob = relative.date_of_birth ? new Date(relative.date_of_birth) : null;
        const sectionKey = RELATIVE_SECTION_KEYS[index] ?? `relative_${index}`;
        const sectionTitle =
          sectionKey === "father"
            ? t("students.relativeSections.father")
            : sectionKey === "mother"
              ? t("students.relativeSections.mother")
              : t("students.relativeSections.relative");

        return (
          <Box
            key={`relative-${index}`}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 2.5,
              backgroundColor: "background.paper",
            }}
          >
            <Typography className="myprofile-panel__title" sx={{ mb: 2 }}>
              {sectionTitle}
            </Typography>

            <Grid container spacing={2.25}>
              <Grid size={{ xs: 12, md: 6 }}>
                <LabelPrimary value={t("students.relative.name")} />
                <TextField
                  value={relative.name ?? ""}
                  onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                  fullWidth
                  variant="outlined"
                  className="main-text__field"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <LabelPrimary value={t("students.relative.birthYear")} />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={relativeDob}
                    onChange={(newValue) =>
                      handleFieldChange(
                        index,
                        "date_of_birth",
                        newValue ? newValue.toISOString() : null
                      )
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LabelPrimary value={t("students.relative.occupation")} />
                <TextField
                  value={relative.occupation ?? ""}
                  onChange={(e) => handleFieldChange(index, "occupation", e.target.value)}
                  fullWidth
                  variant="outlined"
                  className="main-text__field"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LabelPrimary value={t("students.relative.phone")} />
                <TextField
                  value={relative.phone ?? ""}
                  onChange={(e) => handleFieldChange(index, "phone", e.target.value)}
                  fullWidth
                  variant="outlined"
                  className="main-text__field"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LabelPrimary value={t("students.relative.nationality")} />
                <TextField
                  value={relative.nationality ?? ""}
                  onChange={(e) => handleFieldChange(index, "nationality", e.target.value)}
                  fullWidth
                  variant="outlined"
                  className="main-text__field"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LabelPrimary value={t("students.relative.address")} />
                <TextField
                  value={relative.address ?? ""}
                  onChange={(e) => handleFieldChange(index, "address", e.target.value)}
                  fullWidth
                  variant="outlined"
                  className="main-text__field"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LabelPrimary value={t("students.relative.ethnicity")} />
                <TextField
                  value={relative.ethnicity ?? ""}
                  onChange={(e) => handleFieldChange(index, "ethnicity", e.target.value)}
                  fullWidth
                  variant="outlined"
                  className="main-text__field"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LabelPrimary value={t("students.relative.religion")} />
                <TextField
                  value={relative.religion ?? ""}
                  onChange={(e) => handleFieldChange(index, "religion", e.target.value)}
                  fullWidth
                  variant="outlined"
                  className="main-text__field"
                />
              </Grid>
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default RelativeInformationTab;
