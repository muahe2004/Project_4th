import { Box, Tab, Tabs } from "@mui/material";
import { useState, type ReactNode } from "react";
import { CoursePanel } from "../components/panels/CoursePanel";

interface TabPanelProps {
    children?: ReactNode;
    value: number;
    index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box sx={{ mt: 3, mr: 1, ml: 1 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function Courses() {
    const [value, setValue] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box>
            <Tabs className="myprofile-tabs" value={value} onChange={handleChange}>
                <Tab classes={{ selected: "active-tab" }} label="Khoá học" />
                <Tab classes={{ selected: "active-tab" }} label="Chương học" />
                <Tab classes={{ selected: "active-tab" }} label="Bài học" />
                <Tab classes={{ selected: "active-tab" }} label="Câu hỏi" />
                <Tab classes={{ selected: "active-tab" }} label="Hoá đơn" />
            </Tabs>

            <TabPanel value={value} index={0}>
                <CoursePanel/>
            </TabPanel>

            <TabPanel value={value} index={1}>
            </TabPanel>
        </Box>
    );
}

export default Courses;