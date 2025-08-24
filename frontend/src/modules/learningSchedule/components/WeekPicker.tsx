import { useState } from "react";
import { Box, Tooltip } from "@mui/material";
import Button from "../../../components/Button/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import "./styles/WeekPicker.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function WeekPicker() {
    const [week, setWeek] = useState(1);

    const prevWeek = () => {
        setWeek((w) => (w > 1 ? w - 1 : w)); 
    };

    const nextWeek = () => {
        setWeek((w) => w + 1);
    };

    return (
        <Box className="week-picker">
            <Tooltip classes={{ popper: "primary-tooltip" }} placement="top" title="Tuần hiện tại">
                <Button className="week-picker__button" onClick={prevWeek}>
                    <CalendarTodayIcon />
                </Button>
            </Tooltip>
            <Tooltip classes={{ popper: "primary-tooltip" }} placement="top" title="Tuần trước">
                <Button className="week-picker__button" onClick={prevWeek}>
                    <ChevronLeftIcon />
                </Button>
            </Tooltip>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    className="week-picker__time myprofile-text__field"
                    slotProps={{ 
                        textField: { fullWidth: true }
                    }}
                />
            </LocalizationProvider>
            <span className="week-picker__label">Tuần {week}</span>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    className="week-picker__time myprofile-text__field"
                    slotProps={{ 
                        textField: { fullWidth: true }
                    }}
                />
            </LocalizationProvider>
            <Tooltip classes={{ popper: "primary-tooltip" }} placement="top" title="Tuần sau">
                <Button className="week-picker__button" onClick={nextWeek}>
                    <ChevronRightIcon />
                </Button>
            </Tooltip>
        </Box>
    );
}