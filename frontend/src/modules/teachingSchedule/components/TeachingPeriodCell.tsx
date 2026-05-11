import { useTranslation } from "react-i18next";
import type { ITeachingScheduleWithRelations } from "../types";

interface TeachingPeriodCellProps {
  period: number;
  schedules?: ITeachingScheduleWithRelations[];
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function buildTooltip(schedules?: ITeachingScheduleWithRelations[]): string {
  if (!schedules || schedules.length === 0) {
    return "";
  }

  return schedules
    .slice(0, 8)
    .map((schedule, index) => {
      const className = schedule.class?.class_name ?? schedule.class_info?.class_name ?? "-";
      const subjectName = schedule.subject?.subject_name ?? "-";
      const teacherName = schedule.teacher?.teacher_name ?? "-";
      const roomNumber = schedule.room?.room_number ?? "-";
      return [
        `${index + 1}. ${formatDate(schedule.learning_schedule.date)}`,
        `Lớp: ${className}`,
        `Môn: ${subjectName}`,
        `Giảng viên: ${teacherName}`,
        `Phòng: ${roomNumber}`,
        `Tiết: ${schedule.learning_schedule.start_period}-${schedule.learning_schedule.end_period}`,
      ].join("\n");
    })
    .join("\n\n");
}

export function TeachingPeriodCell({ period, schedules }: TeachingPeriodCellProps) {
  const { t } = useTranslation();
  const itemCount = schedules?.length ?? 0;
  const hasSchedule = itemCount > 0;

  return (
    <div
      className={`teaching-room-cell ${
        hasSchedule ? "teaching-room-cell--busy" : "teaching-room-cell--empty"
      }`}
      title={buildTooltip(schedules)}
    >
      <span>{t("teachingSchedules.periodNumber", { period })}</span>
      {itemCount > 1 && (
        <span className="teaching-room-cell__count">{itemCount}</span>
      )}
    </div>
  );
}

export default TeachingPeriodCell;
