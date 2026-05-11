import { useTranslation } from "react-i18next";
import type { IExaminationScheduleResponse } from "../types";

interface ExaminationPeriodCellProps {
  period: number;
  schedules?: IExaminationScheduleResponse[];
}

function formatDateTime(dateValue: string): string {
  const date = new Date(dateValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function buildTooltip(
  schedules: IExaminationScheduleResponse[] | undefined,
  t: (key: string) => string
): string {
  if (!schedules || schedules.length === 0) {
    return "";
  }

  return schedules
    .slice(0, 8)
    .map((schedule, index) => {
      const classCode = schedule.class_info?.class_code ?? "-";
      const className = schedule.class_info?.class_name ?? "-";
      const subjectName = schedule.subject_info?.subject_name ?? "-";
      const roomNumber = schedule.room_info?.room_number ?? "-";
      const invigilators = schedule.invigilator
        .map((teacher) => teacher.invigilator_name)
        .filter(Boolean)
        .join(" - ");

      return [
        `${index + 1}. ${formatDateTime(schedule.start_time)} - ${formatDateTime(schedule.end_time)}`,
        `${t("examinationSchedules.tooltip.class")}: ${classCode} - ${className}`,
        `${t("examinationSchedules.tooltip.subject")}: ${subjectName}`,
        `${t("examinationSchedules.tooltip.room")}: ${roomNumber}`,
        `${t("examinationSchedules.tooltip.invigilator")}: ${invigilators || "-"}`,
      ].join("\n");
    })
    .join("\n\n");
}

export function ExaminationPeriodCell({
  period,
  schedules,
}: ExaminationPeriodCellProps) {
  const { t } = useTranslation();
  const itemCount = schedules?.length ?? 0;
  const hasSchedule = itemCount > 0;

  return (
    <div
      className={`teaching-room-cell ${
        hasSchedule
          ? "teaching-room-cell--busy"
          : "teaching-room-cell--empty"
      }`}
      title={buildTooltip(schedules, t)}
    >
      <span>{String(period).padStart(2, "0")}</span>
      {itemCount > 1 && (
        <span className="teaching-room-cell__count">{itemCount}</span>
      )}
    </div>
  );
}

export default ExaminationPeriodCell;
