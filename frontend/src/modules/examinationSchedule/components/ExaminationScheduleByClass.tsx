import { useEffect, useMemo, useState } from "react";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import Loading from "../../../components/Loading/Loading";
import { useGetExaminationSchedules } from "../apis/getExaminationSchedule";
import type { IExaminationScheduleResponse } from "../types";
import ExaminationPeriodCell from "./ExaminationPeriodCell";
import { getWeekDateRange } from "../../../utils/date/weekRange";
import "../../teachingSchedule/components/styles/TeachingScheduleByRoom.css";
import "./styles/ExaminationScheduleByClass.css";

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

interface ExamClassGroup {
  classKey: string;
  classLabel: string;
  scheduleMap: Map<string, IExaminationScheduleResponse[]>;
}

function getWeekDay(dateValue: string): number {
  return new Date(dateValue).getDay();
}

function mapClassLabel(classInfo: IExaminationScheduleResponse["class_info"]): string {
  const classCode = classInfo?.class_code?.trim() || "";
  const className = classInfo?.class_name?.trim() || "";

  if (classCode && className) {
    return `${classCode} - ${className}`;
  }

  return className || classCode || "Chưa gán lớp";
}

function clampPeriod(period: number): number {
  return Math.max(1, Math.min(12, period));
}

function getPeriodRange(item: IExaminationScheduleResponse): number[] {
  const startHour = new Date(item.start_time).getHours();
  const endHour = new Date(item.end_time).getHours();
  const from = clampPeriod(startHour - 6);
  const to = clampPeriod(Math.max(startHour, endHour) - 6);

  if (to < from) {
    return [from];
  }

  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function toClassGroups(data: IExaminationScheduleResponse[]): ExamClassGroup[] {
  const classMap = new Map<string, ExamClassGroup>();

  data.forEach((item) => {
    const classInfo = item.class_info;
    const classKey = classInfo?.class_id ?? "unknown-class";
    const classLabel = mapClassLabel(classInfo);
    const existingGroup =
      classMap.get(classKey) ??
      {
        classKey,
        classLabel,
        scheduleMap: new Map<string, IExaminationScheduleResponse[]>(),
      };

    const day = getWeekDay(item.date);
    if (day < 0 || day > 6) {
      return;
    }

    getPeriodRange(item).forEach((period) => {
      const key = `${day}-${period}`;
      const existing = existingGroup.scheduleMap.get(key) ?? [];
      existing.push(item);
      existingGroup.scheduleMap.set(key, existing);
    });

    classMap.set(classKey, existingGroup);
  });

  return Array.from(classMap.values()).sort((left, right) =>
    left.classLabel.localeCompare(right.classLabel, "vi")
  );
}

function ExamClassScheduleGrid({
  classLabel,
  scheduleMap,
  showHeader = false,
  firstColumnTitle = "Lớp",
}: {
  classLabel: string;
  scheduleMap: Map<string, IExaminationScheduleResponse[]>;
  showHeader?: boolean;
  firstColumnTitle?: string;
}) {
  return (
    <div className="teaching-room-container">
      {showHeader && (
        <div className="teaching-room-row teaching-room-row--header">
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

      <div className="teaching-room-row teaching-room-row--body teaching-room-row--class">
        <div className="teaching-room-label teaching-room-label--class">
          {classLabel}
        </div>
        {DAYS.map((day) => (
          <div className="teaching-room-day-grid" key={`${classLabel}-${day.value}`}>
            {PERIODS.map((period) => (
              <ExaminationPeriodCell
                key={`${classLabel}-${day.value}-${period}`}
                period={period}
                schedules={scheduleMap.get(`${day.value}-${period}`)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ExaminationScheduleByClassProps {
  search?: string;
  status?: string;
  selectedDate: Date;
}

export function ExaminationScheduleByClass({
  search,
  status,
  selectedDate,
}: ExaminationScheduleByClassProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setPage(1);
  }, [search, status, selectedDate]);

  const dateRange = useMemo(() => getWeekDateRange(selectedDate), [selectedDate]);

  const params = useMemo(
    () => ({
      limit: 2000,
      skip: 0,
      ...(search && { search }),
      ...(status && { status }),
      ...dateRange,
    }),
    [search, status, dateRange]
  );

  const { data: examinationSchedules, isLoading } = useGetExaminationSchedules(params);

  const classGroups = useMemo(
    () => toClassGroups(examinationSchedules?.data ?? []),
    [examinationSchedules?.data]
  );

  const pagedClassGroups = useMemo(
    () => classGroups.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [classGroups, page, rowsPerPage]
  );

  if (isLoading) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        <Loading />
      </div>
    );
  }

  if (classGroups.length === 0) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        Không có lớp nào để hiển thị
      </div>
    );
  }

  return (
    <div className="teaching-schedule-by-room-layout">
      <section className="teaching-schedule-by-room">
        {pagedClassGroups.map((group, index) => (
          <ExamClassScheduleGrid
            key={group.classKey}
            classLabel={group.classLabel}
            scheduleMap={group.scheduleMap}
            showHeader={index === 0}
            firstColumnTitle="Lớp"
          />
        ))}
      </section>

      <div className="teaching-schedule-by-room__pagination">
        <PaginationUniCore
          totalItems={classGroups.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(value) => setPage(value)}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}

export default ExaminationScheduleByClass;
