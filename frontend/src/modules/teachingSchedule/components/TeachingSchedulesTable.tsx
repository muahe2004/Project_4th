import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetTeachingSchedules } from "../apis/getTeachingSchedules";
import type { ITeachingScheduleResponse } from "../types";
import LearningBox from "../../learningSchedule/components/LearningBox";
import "./styles/TeachingSchedulesTable.css";
import "../../learningSchedule/components/styles/LearningScheduleCalender.css";

const PERIODS = Array.from({ length: 16 }, (_, index) => index + 1);
const PERIOD_HEIGHT = 42;

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
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

function clampPeriod(period: number): number {
  const min = PERIODS[0];
  const max = PERIODS[PERIODS.length - 1];
  return Math.max(min, Math.min(max, period));
}

function getPeriodTop(period: number): number {
  const clamped = clampPeriod(period);
  return (clamped - PERIODS[0]) * PERIOD_HEIGHT;
}

function getPeriodCenterTop(period: number): number {
  return getPeriodTop(period) + PERIOD_HEIGHT / 2;
}

function getPeriodBlockHeight(startPeriod: number, endPeriod: number): number {
  const start = clampPeriod(startPeriod);
  const end = clampPeriod(endPeriod);
  const span = Math.max(1, end - start + 1);
  return span * PERIOD_HEIGHT;
}

function isSameDate(source: Date, target: Date): boolean {
  return (
    source.getFullYear() === target.getFullYear() &&
    source.getMonth() === target.getMonth() &&
    source.getDate() === target.getDate()
  );
}

function formatDate(dateValue: string): Date {
  return new Date(dateValue);
}

interface TeachingSchedulesTableProps {
  selectedDate: Date;
  search?: string;
  roomId?: string;
  onEdit?: (teachingSchedule: ITeachingScheduleResponse) => void;
}

export function TeachingSchedulesTable({
  selectedDate,
  search,
  roomId,
  onEdit,
}: TeachingSchedulesTableProps) {
  const { t } = useTranslation();
  const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(monday, index)),
    [monday]
  );
  const weekLabel = `W${String(getIsoWeek(monday)).padStart(2, "0")}`;
  const bodyHeight = PERIODS.length * PERIOD_HEIGHT;

  const params = useMemo(
    () => ({
      limit: 1000,
      skip: 0,
      ...(search && { search }),
      ...{
        start_date: monday.toISOString().slice(0, 10),
        end_date: addDays(monday, 6).toISOString().slice(0, 10),
      },
    }),
    [monday, search]
  );

  const { data, isLoading } = useGetTeachingSchedules(params, true);

  const weekData = useMemo(() => {
    const schedules = data?.data ?? [];
    return schedules.filter((item: ITeachingScheduleResponse) => {
      const scheduleDate = formatDate(item.learning_schedule.date);
      const roomMatches = roomId ? item.room?.room_id === roomId : true;
      return weekDays.some((day) => isSameDate(day, scheduleDate)) && roomMatches;
    });
  }, [data?.data, roomId, weekDays]);

  if (isLoading) {
    return <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">{t("teachingSchedules.table.loading")}</div>;
  }

  return (
    <section className="learning-calender">
      <div className="learning-calender__wrapper">
        <div className="learning-calender__grid">
          <div className="learning-calender__head learning-calender__head-nav">
            <span>{weekLabel}</span>
          </div>

          {weekDays.map((day, index) => (
            <div className="learning-calender__head" key={`${day.toISOString()}-${index}`}>
              <strong>
                {t(`teachingSchedules.weekdays.${index}`)}
              </strong>
            </div>
          ))}

          <div className="learning-calender__time-column" style={{ height: bodyHeight }}>
            {PERIODS.map((period) => (
              <span
                key={period}
                className="learning-calender__time-label"
                style={{ top: getPeriodCenterTop(period) }}
              >
                {t("teachingSchedules.periodLabel", { period })}
              </span>
            ))}
            <div className="learning-calender__hour-line" style={{ top: bodyHeight }} />
          </div>

          {weekDays.map((day) => {
            const events = weekData
              .filter((item) => isSameDate(day, formatDate(item.learning_schedule.date)))
              .sort(
                (left, right) =>
                  left.learning_schedule.start_period - right.learning_schedule.start_period
              );

            return (
              <div
                className="learning-calender__day-column"
                style={{ height: bodyHeight }}
                key={`${day.toISOString()}-content`}
              >
                {PERIODS.map((period) => (
                  <div
                    key={period}
                    className="learning-calender__hour-line"
                    style={{ top: getPeriodTop(period) }}
                  />
                ))}
                <div className="learning-calender__hour-line" style={{ top: bodyHeight }} />

                {events.map((item) => {
                  const top = getPeriodTop(item.learning_schedule.start_period) + 2;
                  const height = Math.max(
                    34,
                    getPeriodBlockHeight(
                      item.learning_schedule.start_period,
                      item.learning_schedule.end_period
                    ) - 4
                  );

                  return (
                    <div
                      className="learning-calender__event"
                      style={{ top, height }}
                      key={item.id}
                    >
                      <div
                        className="teaching-schedule-card"
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
                          title={item.subject?.subject_name ?? t("teachingSchedules.table.subjectFallback")}
                          periodText={t("teachingSchedules.periodRange", {
                            start: item.learning_schedule.start_period,
                            end: item.learning_schedule.end_period,
                          })}
                          roomText={
                            item.room?.room_number
                              ? t("teachingSchedules.roomLabel", { room: item.room.room_number })
                              : undefined
                          }
                          teacherText={item.teacher?.teacher_name ?? undefined}
                          classText={item.class?.class_name ?? undefined}
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

export default TeachingSchedulesTable;
