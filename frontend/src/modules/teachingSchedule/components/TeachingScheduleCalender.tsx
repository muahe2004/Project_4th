import { useMemo } from "react";

import { useGetTeachingSchedules } from "../apis/getTeachingSchedules";
import type { ITeachingScheduleResponse } from "../types";
import { useAuthStore } from "../../../stores/useAuthStore";
import TeachingBox from "./TeachingBox";
import WeekPicker from "../../../components/WeekPicker/WeekPicker";
import "../../learningSchedule/components/styles/LearningScheduleCalender.css";

const PERIOD_STARTS: Record<number, number> = {
  1: 6 * 60 + 45,
  2: 7 * 60 + 35,
  3: 8 * 60 + 30,
  4: 9 * 60 + 20,
  5: 10 * 60 + 15,
  6: 11 * 60 + 5,
  7: 12 * 60 + 30,
  8: 13 * 60 + 20,
  9: 14 * 60 + 10,
  10: 15 * 60,
  11: 15 * 60 + 55,
  12: 16 * 60 + 45,
};

const PERIOD_ENDS: Record<number, number> = {
  1: 7 * 60 + 30,
  2: 8 * 60 + 20,
  3: 9 * 60 + 15,
  4: 10 * 60 + 5,
  5: 11 * 60,
  6: 11 * 60 + 50,
  7: 13 * 60 + 15,
  8: 14 * 60 + 5,
  9: 14 * 60 + 55,
  10: 15 * 60 + 45,
  11: 16 * 60 + 40,
  12: 17 * 60 + 30,
};

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

function toDisplayMinute(totalMinutes: number): string {
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minute = String(totalMinutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

function toMinuteRange(startPeriod: number, endPeriod: number): [number, number] {
  const start = PERIOD_STARTS[startPeriod] ?? PERIOD_STARTS[1];
  const end = PERIOD_ENDS[endPeriod] ?? start + 45;
  return [start, Math.max(end, start + 45)];
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

interface TeachingScheduleCalenderProps {
  selectedDate: Date;
}

export function TeachingScheduleCalender({
  selectedDate,
}: TeachingScheduleCalenderProps) {
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
      ...(user?.id && { teacher_id: user.id }),
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
              <strong>
                {day.toLocaleDateString("vi-VN", {
                  weekday: "long",
                })}
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
                Tiết {period}
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
                  const [startMinute, endMinute] = toMinuteRange(
                    item.learning_schedule.start_period,
                    item.learning_schedule.end_period
                  );
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
                      <TeachingBox
                        title={item.subject?.subject_name ?? "Môn học"}
                        periodText={`Tiết ${item.learning_schedule.start_period} - ${item.learning_schedule.end_period}`}
                        timeText={`(${toDisplayMinute(startMinute)} - ${toDisplayMinute(endMinute)})`}
                        roomText={
                          item.room?.room_number
                            ? `Phòng ${item.room.room_number}`
                            : undefined
                        }
                        classText={item.class?.class_name ?? undefined}
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

export default TeachingScheduleCalender;
