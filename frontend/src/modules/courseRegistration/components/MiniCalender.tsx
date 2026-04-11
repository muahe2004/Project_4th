import { useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import {
    endOfWeek,
    format,
    isSameDay,
    parseISO,
    startOfWeek,
} from "date-fns";
import type { IClassesRegisterSchedule } from "../types";
import "./styles/MiniCalender.css";

type MiniCalenderProps = {
    schedules?: IClassesRegisterSchedule[];
};

type MiniCalendarDayProps = PickersDayProps & {
    selectedDate: Date | null;
    scheduleDates: Date[];
};

function MiniCalendarDay(props: MiniCalendarDayProps) {
    const { day, outsideCurrentMonth, selectedDate, scheduleDates, ...other } = props;
    const primaryMain = "#343D60";

    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
    const hasSchedule = scheduleDates.some((scheduleDate) => isSameDay(scheduleDate, day));

    return (
        <Box
            className="mini-calender__day-wrapper"
        >
            <PickersDay
                {...other}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
                disableMargin
                selected={false}
                className={`mini-calender__day${isSelected ? " mini-calender__day--selected" : ""}${
                    hasSchedule && !isSelected ? " mini-calender__day--scheduled" : ""
                }${outsideCurrentMonth ? " mini-calender__day--outside" : ""}`}
                sx={{
                    fontSize: "1.05rem",
                    fontWeight: isSelected ? 700 : 500,
                    "&:hover": {
                        backgroundColor: isSelected
                            ? primaryMain
                            : "rgba(15,23,42,0.05)",
                    },
                }}
            />
        </Box>
    );
}

export function MiniCalender({ schedules = [] }: MiniCalenderProps) {
    const parsedDates = useMemo(
        () =>
            schedules
                .map((schedule) => {
                    try {
                        return parseISO(schedule.date);
                    } catch {
                        return null;
                    }
                })
                .filter((value): value is Date => value instanceof Date && !Number.isNaN(value.getTime())),
        [schedules]
    );

    const [selectedDate] = useState<Date | null>(new Date());

    const CalendarDay = (props: PickersDayProps) => (
        <MiniCalendarDay
            {...props}
            selectedDate={selectedDate}
            scheduleDates={parsedDates}
        />
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box className="mini-calender">
                <Stack spacing={1.5}>
                    <Box>
                        <Typography
                            className="mini-calender__eyebrow"
                        >
                            Mini Calendar
                        </Typography>
                        <Typography className="mini-calender__range">
                            {selectedDate
                                ? `Tuan ${format(
                                      startOfWeek(selectedDate, { weekStartsOn: 1 }),
                                      "dd/MM"
                                  )} - ${format(
                                      endOfWeek(selectedDate, { weekStartsOn: 1 }),
                                      "dd/MM"
                                  )}`
                                : "Chua chon ngay"}
                        </Typography>
                    </Box>

                    <DateCalendar
                        value={selectedDate}
                        showDaysOutsideCurrentMonth
                        fixedWeekNumber={6}
                        views={["day"]}
                        readOnly
                        disableFuture={false}
                        disabled
                        className="mini-calender__calendar"
                        slots={{
                            day: CalendarDay,
                        }}
                    />
                </Stack>
            </Box>
        </LocalizationProvider>
    );
}

export default MiniCalender;
