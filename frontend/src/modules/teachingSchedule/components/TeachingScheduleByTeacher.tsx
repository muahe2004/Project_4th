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

const EXTRA_PREVIEW_TEACHERS = 8;

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
  toMockSchedule("4", 203, "2026-03-26T00:00:00.000Z", 8, 10, "React", "Lớp FE 1", "Tạ Minh Nguyệt "),
  toMockSchedule("5", 204, "2026-03-27T00:00:00.000Z", 1, 2, "DBMS", "Lớp CSDL", "Lý Văn Minh"),
  toMockSchedule("6", 205, "2026-03-29T00:00:00.000Z", 5, 7, "KTPM", "Lớp Test 2", "Nguyễn Dương Phương Anh"),
];

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
        toTeacherGroups(
          teachingSchedules?.data?.length ? teachingSchedules.data : MOCK_SCHEDULES
        ),
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
