import { useMemo, useState } from "react";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import RoomScheduleGrid from "./RoomScheduleGrid";
import type { ITeachingScheduleResponse } from "../types";
import "./styles/TeachingScheduleByRoom.css";

interface TeachingScheduleByClassProps {
  teachingSchedules?: {
    data: ITeachingScheduleResponse[];
    total: number;
  };
}

interface ClassGroup {
  classKey: string;
  classLabel: string;
  scheduleMap: Map<string, ITeachingScheduleResponse[]>;
}

const EXTRA_PREVIEW_CLASSES = 0;

function getWeekDay(dateValue: string): number {
  const date = new Date(dateValue);
  return date.getDay();
}

function mapClassLabel(item: ITeachingScheduleResponse): string {
  const className = item.class?.class_name?.trim();
  if (className) {
    return className;
  }
  return "Chưa gán lớp";
}

function getPeriodRange(item: ITeachingScheduleResponse): number[] {
  const start = item.learning_schedule.start_period;
  const end = item.learning_schedule.end_period;
  const from = Math.max(1, Math.min(12, start));
  const to = Math.max(1, Math.min(12, end));
  if (to < from) {
    return [from];
  }
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function toClassGroups(data: ITeachingScheduleResponse[]): ClassGroup[] {
  const classMap = new Map<string, ClassGroup>();

  data.forEach((item) => {
    const day = getWeekDay(item.learning_schedule.date);
    if (day < 0 || day > 6) {
      return;
    }

    const classLabel = mapClassLabel(item);
    const classKey = item.class?.class_id ?? `class-${classLabel}`;
    const current = classMap.get(classKey) ?? {
      classKey,
      classLabel,
      scheduleMap: new Map<string, ITeachingScheduleResponse[]>(),
    };

    getPeriodRange(item).forEach((period) => {
      const key = `${day}-${period}`;
      const existing = current.scheduleMap.get(key) ?? [];
      existing.push(item);
      current.scheduleMap.set(key, existing);
    });

    classMap.set(classKey, current);
  });

  return [...classMap.values()].sort((left, right) =>
    left.classLabel.localeCompare(right.classLabel, "vi")
  );
}

function appendPreviewClasses(groups: ClassGroup[], count: number): ClassGroup[] {
  if (count <= 0) {
    return groups;
  }

  const usedLabels = new Set(groups.map((item) => item.classLabel));
  const previewGroups: ClassGroup[] = [];
  let nextClassNumber = 1;

  while (previewGroups.length < count) {
    const classLabel = `Lớp ${String(nextClassNumber).padStart(2, "0")}`;
    if (!usedLabels.has(classLabel)) {
      previewGroups.push({
        classKey: `preview-${classLabel}`,
        classLabel,
        scheduleMap: new Map<string, ITeachingScheduleResponse[]>(),
      });
      usedLabels.add(classLabel);
    }
    nextClassNumber += 1;
  }

  return [...groups, ...previewGroups].sort((left, right) =>
    left.classLabel.localeCompare(right.classLabel, "vi")
  );
}

export function TeachingScheduleByClass({
  teachingSchedules,
}: TeachingScheduleByClassProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const classGroups = useMemo(
    () =>
      appendPreviewClasses(
        toClassGroups(teachingSchedules?.data ?? []),
        EXTRA_PREVIEW_CLASSES
      ),
    [teachingSchedules?.data]
  );

  const pagedGroups = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return classGroups.slice(start, end);
  }, [classGroups, page, rowsPerPage]);

  if (classGroups.length === 0) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        Không có lịch dạy để hiển thị theo lớp
      </div>
    );
  }

  return (
    <div className="teaching-schedule-by-room-layout">
      <section className="teaching-schedule-by-room">
        {pagedGroups.map((group, index) => (
          <RoomScheduleGrid
            key={group.classKey}
            roomLabel={group.classLabel}
            scheduleMap={group.scheduleMap}
            showHeader={index === 0}
            firstColumnTitle="Lớp"
            variant="class"
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

export default TeachingScheduleByClass;
