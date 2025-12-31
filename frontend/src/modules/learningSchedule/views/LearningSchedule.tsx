import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, Tab, Tabs, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

import { LearningScheduleTable } from "../components/LearningScheduleTable";
import WeekPicker from "../components/WeekPicker";


import "./styles/learningSchedule.css"
import { useState, type ReactNode } from "react";

interface TabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ mt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function LearningSchedule() {
    const { t } = useTranslation();

    const [value, setValue] = useState<number>(0);
    
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
  
    return (
        <main className="learningSchedule">
            <Typography className="primary-title">
                THÔNG TIN LỊCH HỌC
            </Typography>

            <Tabs className="myprofile-tabs" value={value} onChange={handleChange}>
                <Tab classes={{ selected: "active-tab" }} label="Lịch học theo tuần" />
                <Tab classes={{ selected: "active-tab" }} label="Lịch học dự kiến theo tuần" />
            </Tabs>

            <TabPanel value={value} index={0}>

                <Box className="learning-schedule__flex">
                    {/* <FormControl className="learningSchedule-controller">
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

                    <FormControl className="learningSchedule-controller">
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
                    </FormControl> */}

                </Box>

                <WeekPicker></WeekPicker>
                                
                <LearningScheduleTable></LearningScheduleTable>
            </TabPanel>

            <TabPanel value={value} index={1}>
                <Typography className="primary-title">
                    LỊCH HỌC THEO KỲ
                </Typography>
            </TabPanel>
        </main>
    );
}

export default LearningSchedule;
