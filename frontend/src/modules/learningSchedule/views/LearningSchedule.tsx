import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

import { LearningScheduleTable } from "../components/LearningScheduleTable";

import "./styles/learningSchedule.css"

export function LearningSchedule() {
    const { t } = useTranslation();
  
    return (
        <main className="learningSchedule">
            <Typography className="primary-title">
                THÔNG TIN LỊCH HỌC
            </Typography>

            <LearningScheduleTable></LearningScheduleTable>
        </main>
    );
}

export default LearningSchedule;
