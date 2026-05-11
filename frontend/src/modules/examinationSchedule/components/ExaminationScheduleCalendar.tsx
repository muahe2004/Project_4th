import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useGetExaminationSchedules } from "../apis/getExaminationSchedule";
import type { IExaminationScheduleResponse } from "../types";
import LearningBox from "../../learningSchedule/components/LearningBox";
import "./styles/ExaminationScheduleCalendar.css";
import "../../teachingSchedule/components/styles/TeachingScheduleByRoom.css";
import "../../learningSchedule/components/styles/LearningScheduleCalender.css";

const HOURS = Array.from({ length: 14 }, (_, index) => index + 7);
const HOUR_HEIGHT = 48;

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): Date {
  const source = new Date(date);
  const day = source.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  source.setHours(0, 0, 0, 0);
  source.setDate(source.getDate() + diff);
  return source;
}

function getIsoWeek(date: Date): number {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() + 3 - ((current.getDay() + 6) % 7));
  const firstThursday = new Date(current.getFullYear(), 0, 4);
  firstThursday.setDate(
    firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7)
  );
  return 1 + Math.round(((current.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7);
}

function clampHour(hour: number): number {
  const min = HOURS[0];
  const max = HOURS[HOURS.length - 1];
  return Math.max(min, Math.min(max, hour));
}

function getHourTop(hour: number): number {
  const clamped = clampHour(hour);
  return (clamped - HOURS[0]) * HOUR_HEIGHT;
}

function getHourCenterTop(hour: number): number {
  return getHourTop(hour) + HOUR_HEIGHT / 2;
}

function getMinuteOffset(dateValue: string): number {
  const date = new Date(dateValue);
  return (date.getMinutes() / 60) * HOUR_HEIGHT;
}

function toLocalDateKey(value: string): string {
  const date = new Date(value);
  return formatLocalDate(date);
}

interface ExaminationScheduleCalendarProps {
  selectedDate: Date;
  search?: string;
  roomId?: string;
  onEdit?: (schedule: IExaminationScheduleResponse) => void;
}

export function ExaminationScheduleCalendar({
  selectedDate,
  search,
  roomId,
  onEdit,
}: ExaminationScheduleCalendarProps) {
  const { t } = useTranslation();
  const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(monday, index)),
    [monday]
  );
  const weekLabel = `W${String(getIsoWeek(monday)).padStart(2, "0")}`;
  const bodyHeight = HOURS.length * HOUR_HEIGHT;

  const params = useMemo(
    () => ({
      limit: 1000,
      skip: 0,
      ...(search && { search }),
      start_date: formatLocalDate(monday),
      end_date: formatLocalDate(addDays(monday, 6)),
    }),
    [monday, search]
  );

  const { data, isLoading } = useGetExaminationSchedules(params);

  const weekData = useMemo(() => {
    const schedules = data?.data ?? [];
    return schedules.filter((item: IExaminationScheduleResponse) => {
      const scheduleDateKey = toLocalDateKey(item.date);
      const roomMatches = roomId ? item.room_info?.room_id === roomId : true;
      return weekDays.some((day) => formatLocalDate(day) === scheduleDateKey) && roomMatches;
    });
  }, [data?.data, roomId, weekDays]);

  if (isLoading) {
    return <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">{t("examinationSchedules.calendar.loading")}</div>;
  }

  const calendarStyle = {
    "--examination-body-height": `${bodyHeight}px`,
  } as CSSProperties;

  return (
    <section className="examination-calendar" style={calendarStyle}>
      <div className="examination-calendar__wrapper">
        <div className="examination-calendar__grid">
          <div className="examination-calendar__head examination-calendar__head-nav">
            <span>{weekLabel}</span>
          </div>

          {weekDays.map((day, index) => (
            <div className="examination-calendar__head" key={`${day.toISOString()}-${index}`}>
              <strong>{t(`examinationSchedules.calendar.days.${index}`)}</strong>
            </div>
          ))}

          <div className="examination-calendar__time-column" style={{ height: bodyHeight }}>
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="examination-calendar__time-label"
                style={{ top: getHourCenterTop(hour) }}
              >
                {String(hour).padStart(2, "0")}:00
              </span>
            ))}
            <div className="examination-calendar__hour-line" style={{ top: bodyHeight }} />
          </div>

          {weekDays.map((day) => {
            const events = weekData
              .filter((item) => formatLocalDate(day) === toLocalDateKey(item.date))
              .sort((left, right) =>
                new Date(left.start_time).getTime() - new Date(right.start_time).getTime()
              );

            return (
              <div
                className="examination-calendar__day-column"
                style={{ height: bodyHeight }}
                key={`${day.toISOString()}-content`}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="examination-calendar__hour-line"
                    style={{ top: getHourTop(hour) }}
                  />
                ))}
                <div className="examination-calendar__hour-line" style={{ top: bodyHeight }} />

                {events.map((item) => {
                  const startDate = new Date(item.start_time);
                  const endDate = new Date(item.end_time);
                  const startHour = startDate.getHours();
                  const endHour = endDate.getHours();
                  const top = getHourTop(startHour) + getMinuteOffset(item.start_time) + 2;
                  const rawHeight =
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60) * HOUR_HEIGHT;
                  const height = Math.max(92, rawHeight - 4);

                  return (
                    <div
                      className="examination-calendar__event"
                      style={{ top, height }}
                      key={item.id}
                    >
                      <div
                        className="teaching-schedule-card examination-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => onEdit?.(item)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onEdit?.(item);
                          }
                        }}
                      >
                        <LearningBox
                          title={item.subject_info?.subject_name ?? t("examinationSchedules.subjectFallback")}
                          periodText={t("examinationSchedules.periodRange", {
                            start: new Date(item.start_time).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                            end: new Date(item.end_time).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                          })}
                          roomText={
                            item.room_info?.room_number ? t("examinationSchedules.roomLabel", { room: item.room_info.room_number }) : undefined
                          }
                          teacherText={item.invigilator?.[0]?.invigilator_name ?? undefined}
                          classText={item.class_info?.class_code ?? item.class_info?.class_name ?? undefined}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ExaminationScheduleCalendar;
