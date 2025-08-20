import { Box, Toolbar, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

import { StudentInformation } from "../components/StudentInformation"

import "./styles/Grades.css";
import ScoresTable from "../components/ScoresTable";

export function GradesPage() {
    const { t } = useTranslation();
  
    return (
        <main className="academic-results">
            <Typography className="primary-title">
                KẾT QUẢ HỌC TẬP
            </Typography>

            <StudentInformation></StudentInformation>
            <ScoresTable></ScoresTable>
        </main>
    );
}

export default GradesPage;
