import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

import StudentTotalScore from "../components/StudentTotalScore"
import ScoresTable from "../components/ScoresTable";

import "./styles/Grades.css";

export function GradesPage() {
    const { t } = useTranslation();
  
    return (
        <main className="grades">
            <Typography className="primary-title">
                KẾT QUẢ HỌC TẬP
            </Typography>

            <StudentTotalScore></StudentTotalScore>

            <Box className="grades-flex">
                <FormControl className="grades-controller">
                    <InputLabel className="select-primary__label" id="demo-simple-select-helper-label">Học kỳ</InputLabel>
                    <Select
                        className="select-primary"
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        label="Học kỳ"
                        MenuProps={{
                            disableScrollLock: true,   
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                </FormControl>

                <FormControl className="grades-controller">
                    <InputLabel className="select-primary__label" id="demo-simple-select-helper-label">Năm học</InputLabel>
                    <Select
                        className="select-primary"
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        label="Năm học"
                        MenuProps={{
                            disableScrollLock: true,   
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                </FormControl>

                <FormControl className="grades-controller">
                    <InputLabel className="select-primary__label" id="demo-simple-select-helper-label">Ngành học</InputLabel>
                    <Select
                        className="select-primary"
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        label="Ngành học"
                        MenuProps={{
                            disableScrollLock: true,   
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                </FormControl>

                <FormControl className="grades-controller">
                    <InputLabel className="select-primary__label" id="demo-simple-select-helper-label">Học phần</InputLabel>
                    <Select
                        className="select-primary"
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        label="Học phần"
                        MenuProps={{
                            disableScrollLock: true,   
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <ScoresTable></ScoresTable>
        </main>
    );
}

export default GradesPage;
