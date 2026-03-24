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

const EXTRA_PREVIEW_CLASSES = 8;

function toMockSchedule(
  id: string,
  roomNumber: number,
  date: string,
  startPeriod: number,
  endPeriod: number,
  subjectName: string,
  className: string,
  teacherName: string
): ITeachingScheduleResponse {
  return {
    id,
    status: "active",
    created_at: "2026-03-20T10:00:00.000Z",
    updated_at: "2026-03-20T10:00:00.000Z",
    teacher: {
      teacher_id: `teacher-${id}`,
      teacher_name: teacherName,
      teacher_email: "",
      teacher_phone: "",
    },
    class: {
      class_id: `class-${id}`,
      class_name: className,
      class_code: "",
    },
    subject: {
      subject_id: `subject-${id}`,
      subject_name: subjectName,
    },
    room: {
      room_id: `room-${roomNumber}`,
      room_number: roomNumber,
    },
    learning_schedule: {
      id: `ls-${id}`,
      class_id: `class-${id}`,
      subject_id: `subject-${id}`,
      room_id: `room-${roomNumber}`,
      date,
      start_period: startPeriod,
      end_period: endPeriod,
      schedule_type: "theory",
      status: "active",
      created_at: "2026-03-20T10:00:00.000Z",
      updated_at: "2026-03-20T10:00:00.000Z",
    },
  };
}

const MOCK_SCHEDULES: ITeachingScheduleResponse[] = [
  toMockSchedule("1", 201, "2026-03-23T00:00:00.000Z", 1, 3, "Cấu trúc dữ liệu", "Lớp Web 2", "Lý Văn Minh"),
  toMockSchedule("2", 201, "2026-03-25T00:00:00.000Z", 7, 9, "Giải tích", "Lớp Web 1", "Nguyễn Chi Nam"),
  toMockSchedule("3", 202, "2026-03-24T00:00:00.000Z", 2, 4, "OOP", "Lớp Java 2", "Đỗ Phương Thùy"),
  toMockSchedule("4", 203, "2026-03-26T00:00:00.000Z", 8, 10, "React", "Lớp FE 1", "Tạ Minh Nguyệt"),
  toMockSchedule("5", 204, "2026-03-27T00:00:00.000Z", 1, 2, "DBMS", "Lớp CSDL", "Lý Văn Minh"),
  toMockSchedule("6", 205, "2026-03-29T00:00:00.000Z", 5, 7, "KTPM", "Lớp Test 2", "Nguyễn Dương Phương Anh"),
];

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
        toClassGroups(teachingSchedules?.data?.length ? teachingSchedules.data : MOCK_SCHEDULES),
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
