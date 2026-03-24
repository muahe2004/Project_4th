import TeachingPeriodCell from "./TeachingPeriodCell";
import type { ITeachingScheduleResponse } from "../types";

const DAYS = [
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
  { label: "Chủ nhật", value: 0 },
];

const PERIODS = Array.from({ length: 12 }, (_, index) => index + 1);

interface TeachingRoomContainerProps {
  roomLabel: string;
  rowLabel?: string;
  scheduleMap: Map<string, ITeachingScheduleResponse[]>;
  showHeader?: boolean;
  firstColumnTitle?: string;
  variant?: string;
  [key: string]: unknown;
}

function getKey(day: number, period: number): string {
  return `${day}-${period}`;
}

export function RoomScheduleGrid({
  roomLabel,
  rowLabel,
  scheduleMap,
  showHeader = false,
  firstColumnTitle = "Phòng",
  variant = "room",
}: TeachingRoomContainerProps) {
  const displayLabel = rowLabel ?? roomLabel ?? "";
  const isTeacherVariant = variant === "teacher";
  const isClassVariant = variant === "class";
  const rowClassName = `teaching-room-row ${
    isTeacherVariant
      ? "teaching-room-row--teacher"
      : isClassVariant
        ? "teaching-room-row--class"
        : ""
  }`;
  const labelClassName = `teaching-room-label ${
    isTeacherVariant
      ? "teaching-room-label--teacher"
      : isClassVariant
        ? "teaching-room-label--class"
        : ""
  }`;

  return (
    <div className="teaching-room-container">
      {showHeader && (
        <div className={`${rowClassName} teaching-room-row--header`}>
          <div className="teaching-room-label teaching-room-label--header">
            {firstColumnTitle}
          </div>
          {DAYS.map((day) => (
            <div
              className="teaching-room-day-title teaching-room-day-title--header"
              key={day.value}
            >
              {day.label}
            </div>
          ))}
        </div>
      )}

      <div className={`${rowClassName} teaching-room-row--body`}>
        <div className={labelClassName}>{displayLabel}</div>
        {DAYS.map((day) => (
          <div className="teaching-room-day-grid" key={`${displayLabel}-${day.value}`}>
            {PERIODS.map((period) => (
              <TeachingPeriodCell
                key={`${displayLabel}-${day.value}-${period}`}
                period={period}
                schedules={scheduleMap.get(getKey(day.value, period))}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomScheduleGrid;
