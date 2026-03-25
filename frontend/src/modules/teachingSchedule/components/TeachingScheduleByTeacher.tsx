import { useMemo, useState } from "react";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import RoomScheduleGrid from "./RoomScheduleGrid";
import type { ITeachingScheduleResponse } from "../types";
import "./styles/TeachingScheduleByRoom.css";

interface TeachingScheduleByTeacherProps {
  teachingSchedules?: {
    data: ITeachingScheduleResponse[];
    total: number;
  };
}

interface TeacherGroup {
  teacherKey: string;
  teacherLabel: string;
  scheduleMap: Map<string, ITeachingScheduleResponse[]>;
}

const EXTRA_PREVIEW_TEACHERS = 0;

function getWeekDay(dateValue: string): number {
  const date = new Date(dateValue);
  return date.getDay();
}

function mapTeacherLabel(item: ITeachingScheduleResponse): string {
  const teacherName = item.teacher?.teacher_name?.trim();
  if (teacherName) {
    return teacherName;
  }
  return "Chưa gán giảng viên";
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

function toTeacherGroups(data: ITeachingScheduleResponse[]): TeacherGroup[] {
  const teacherMap = new Map<string, TeacherGroup>();

  data.forEach((item) => {
    const day = getWeekDay(item.learning_schedule.date);
    if (day < 0 || day > 6) {
      return;
    }

    const teacherLabel = mapTeacherLabel(item);
    const teacherKey = item.teacher?.teacher_id ?? `teacher-${teacherLabel}`;
    const current = teacherMap.get(teacherKey) ?? {
      teacherKey,
      teacherLabel,
      scheduleMap: new Map<string, ITeachingScheduleResponse[]>(),
    };

    getPeriodRange(item).forEach((period) => {
      const key = `${day}-${period}`;
      const existing = current.scheduleMap.get(key) ?? [];
      existing.push(item);
      current.scheduleMap.set(key, existing);
    });

    teacherMap.set(teacherKey, current);
  });

  return [...teacherMap.values()].sort((left, right) =>
    left.teacherLabel.localeCompare(right.teacherLabel, "vi")
  );
}

function appendPreviewTeachers(groups: TeacherGroup[], count: number): TeacherGroup[] {
  if (count <= 0) {
    return groups;
  }

  const usedLabels = new Set(groups.map((item) => item.teacherLabel));
  const previewGroups: TeacherGroup[] = [];
  let nextTeacherNumber = 1;

  while (previewGroups.length < count) {
    const teacherLabel = `Giảng viên ${String(nextTeacherNumber).padStart(2, "0")}`;
    if (!usedLabels.has(teacherLabel)) {
      previewGroups.push({
        teacherKey: `preview-${teacherLabel}`,
        teacherLabel,
        scheduleMap: new Map<string, ITeachingScheduleResponse[]>(),
      });
      usedLabels.add(teacherLabel);
    }
    nextTeacherNumber += 1;
  }

  return [...groups, ...previewGroups].sort((left, right) =>
    left.teacherLabel.localeCompare(right.teacherLabel, "vi")
  );
}

export function TeachingScheduleByTeacher({
  teachingSchedules,
}: TeachingScheduleByTeacherProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const teacherGroups = useMemo(
    () =>
      appendPreviewTeachers(
        toTeacherGroups(teachingSchedules?.data ?? []),
        EXTRA_PREVIEW_TEACHERS
      ),
    [teachingSchedules?.data]
  );

  const pagedGroups = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return teacherGroups.slice(start, end);
  }, [teacherGroups, page, rowsPerPage]);

  if (teacherGroups.length === 0) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        Không có lịch dạy để hiển thị theo giảng viên
      </div>
    );
  }

  return (
    <div className="teaching-schedule-by-room-layout">
      <section className="teaching-schedule-by-room">
        {pagedGroups.map((group, index) => (
          <RoomScheduleGrid
            key={group.teacherKey}
            roomLabel={group.teacherLabel}
            scheduleMap={group.scheduleMap}
            showHeader={index === 0}
            firstColumnTitle="Giảng viên"
            variant="teacher"
          />
        ))}
      </section>

      <div className="teaching-schedule-by-room__pagination">
        <PaginationUniCore
          totalItems={teacherGroups.length}
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

export default TeachingScheduleByTeacher;
