import { Box, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useTranslation } from "react-i18next";

import "./WeekPicker.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Button from "../Button/Button";

interface WeekPickerProps {
    selectedDate: Date;
    onChangeDate: (date: Date) => void;
}

function addDays(date: Date, days: number): Date {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

export default function WeekPicker({ selectedDate, onChangeDate }: WeekPickerProps) {
    const { t } = useTranslation();

    const prevWeek = () => {
        onChangeDate(addDays(selectedDate, -7));
    };

    const nextWeek = () => {
        onChangeDate(addDays(selectedDate, 7));
    };

    return (
        <Box className="week-picker">
            <Tooltip classes={{ popper: "primary-tooltip" }} placement="top" title={t("weekPicker.currentWeek")}>
                <Button className="week-picker__button" onClick={() => onChangeDate(new Date())}>
                    <CalendarTodayIcon />
                </Button>
            </Tooltip>
            <Tooltip classes={{ popper: "primary-tooltip" }} placement="top" title={t("weekPicker.previousWeek")}>
                <Button className="week-picker__button" onClick={prevWeek}>
                    <ChevronLeftIcon />
                </Button>
            </Tooltip>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    value={selectedDate}
                    onChange={(value) => {
                        if (value) {
                            onChangeDate(value);
                        }
                    }}
                    className="week-picker__time main-text__field"
                    slotProps={{ 
                        textField: { fullWidth: true }
                    }}
                />
            </LocalizationProvider>
            <Tooltip classes={{ popper: "primary-tooltip" }} placement="top" title={t("weekPicker.nextWeek")}>
                <Button className="week-picker__button" onClick={nextWeek}>
                    <ChevronRightIcon />
                </Button>
            </Tooltip>
        </Box>
    );
}
