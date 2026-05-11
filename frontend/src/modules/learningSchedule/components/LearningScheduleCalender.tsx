import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useGetTeachingSchedules } from "../../teachingSchedule/apis/getTeachingSchedules";
import type { ITeachingScheduleResponse } from "../../teachingSchedule/types";
import { useAuthStore } from "../../../stores/useAuthStore";
import LearningBox from "./LearningBox";
import "./styles/LearningScheduleCalender.css";

const PERIODS = Array.from({ length: 11 }, (_, index) => index + 1);
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
  return (
    1 +
    Math.round(
      ((current.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7
    )
  );
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

interface LearningScheduleCalenderProps {
  selectedDate: Date;
}

export function LearningScheduleCalender({
  selectedDate,
}: LearningScheduleCalenderProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(monday, index)),
    [monday]
  );
  const weekLabel = `W${String(getIsoWeek(monday)).padStart(2, "0")}`;
  const bodyHeight = PERIODS.length * PERIOD_HEIGHT;
  const queryParams = useMemo(
    () => ({
      limit: 1000,
      skip: 0,
      status: "active",
      ...(user?.id && { student_id: user.id }),
    }),
    [user?.id]
  );

  const { data } = useGetTeachingSchedules(queryParams, Boolean(user?.id));

  const weekData = useMemo(() => {
    const schedules = data?.data ?? [];
    return schedules.filter((item: ITeachingScheduleResponse) => {
      const scheduleDate = new Date(item.learning_schedule.date);
      return weekDays.some((day) => isSameDate(day, scheduleDate));
    });
  }, [data?.data, weekDays]);

  return (
    <section className="learning-calender">
      <div className="learning-calender__wrapper">
        <div className="learning-calender__grid">
          <div className="learning-calender__head learning-calender__head-nav">
            <span>{weekLabel}</span>
          </div>

          {weekDays.map((day) => (
            <div className="learning-calender__head" key={day.toISOString()}>
              <strong>{t(`learningSchedule.weekdays.${day.getDay()}`)}</strong>
            </div>
          ))}

          <div
            className="learning-calender__time-column"
            style={{ height: bodyHeight }}
          >
            {PERIODS.map((period) => (
              <span
                key={period}
                className="learning-calender__time-label"
                style={{ top: getPeriodCenterTop(period) }}
              >
                {t("learningSchedule.periodLabel", { period })}
              </span>
            ))}
            <div className="learning-calender__hour-line" style={{ top: bodyHeight }} />
          </div>

          {weekDays.map((day) => {
            const events = weekData
              .filter((item) => isSameDate(day, new Date(item.learning_schedule.date)))
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
                      <LearningBox
                        title={
                          item.subject?.subject_name ?? t("learningSchedule.subjectFallback")
                        }
                        periodText={t("learningSchedule.periodRange", {
                          start: item.learning_schedule.start_period,
                          end: item.learning_schedule.end_period,
                        })}
                        roomText={
                          item.room?.room_number
                            ? t("learningSchedule.roomLabel", { room: item.room.room_number })
                            : undefined
                        }
                        teacherText={item.teacher?.teacher_name ?? undefined}
                      />
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

export default LearningScheduleCalender;
