import { useCallback, useMemo, useState } from "react";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import type { IClassesRegisterSchedule } from "../types";
import "./styles/MiniCalender.css";

type MiniCalenderProps = {
    schedules?: IClassesRegisterSchedule[];
    selectedDate?: Date | null;
    onChangeDate?: (date: Date) => void;
    className?: string;
};

type MiniCalendarDayProps = PickersDayProps & {
    selectedDate: Date | null;
    scheduleDates: Date[];
};

function MiniCalendarDay(props: MiniCalendarDayProps) {
    const { day, outsideCurrentMonth, selectedDate, scheduleDates, ...other } = props;
    const theme = useTheme();

    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
    const hasSchedule = scheduleDates.some((scheduleDate) => isSameDay(scheduleDate, day));
    const className = [
        "mini-calender__day",
        isSelected ? "mini-calender__day--selected" : "",
        hasSchedule && !isSelected ? "mini-calender__day--scheduled" : "",
        outsideCurrentMonth ? "mini-calender__day--outside" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Box className="mini-calender__day-wrapper">
            <PickersDay
                {...other}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
                disableMargin
                selected={false}
                className={className}
                sx={{
                    fontSize: "1.05rem",
                    fontWeight: isSelected ? 700 : 500,
                    "&:hover": {
                        backgroundColor: isSelected
                            ? theme.palette.primary.main
                            : "rgba(15,23,42,0.05)",
                    },
                }}
            />
        </Box>
    );
}

export function MiniCalender({
    schedules = [],
    selectedDate: controlledSelectedDate,
    onChangeDate,
    className,
}: MiniCalenderProps) {
    const [uncontrolledSelectedDate, setUncontrolledSelectedDate] = useState<Date | null>(new Date());

    const parsedDates = useMemo(
        () =>
            schedules
                .map((schedule) => parseISO(schedule.date))
                .filter((value): value is Date => !Number.isNaN(value.getTime())),
        [schedules]
    );

    const selectedDate =
        controlledSelectedDate !== undefined ? controlledSelectedDate : uncontrolledSelectedDate;

    const CalendarDay = useCallback(
        (props: PickersDayProps) => (
            <MiniCalendarDay
                {...props}
                selectedDate={selectedDate}
                scheduleDates={parsedDates}
            />
        ),
        [parsedDates, selectedDate]
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box className={`mini-calender${className ? ` ${className}` : ""}`}>
                <Stack spacing={1.5}>
                    <Box>
                        <Typography className="mini-calender__range">
                            {selectedDate
                                ? `Tuan ${format(
                                      startOfWeek(selectedDate, { weekStartsOn: 1 }),
                                      "dd/MM"
                                  )} - ${format(
                                      endOfWeek(selectedDate, { weekStartsOn: 1 }),
                                      "dd/MM"
                                  )}`
                                : "Chưa chọn ngày"}
                        </Typography>
                    </Box>

                    <DateCalendar
                        value={selectedDate}
                        onChange={(date) => {
                            if (!date) {
                                return;
                            }

                            if (onChangeDate) {
                                onChangeDate(date);
                                return;
                            }

                            setUncontrolledSelectedDate(date);
                        }}
                        showDaysOutsideCurrentMonth
                        fixedWeekNumber={6}
                        views={["day"]}
                        disableFuture={false}
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
