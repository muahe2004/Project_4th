import { Box, Toolbar, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

import { StudentInformation } from "../components/StudentInformation"

import "./styles/Grades.css";

export function GradesPage() {
    const { t } = useTranslation();
  
    return (
        <main className="academic-results">
            <Typography className="primary-title">
                KẾT QUẢ HỌC TẬP
            </Typography>

            <StudentInformation></StudentInformation>
        </main>
    );
}

export default GradesPage;
