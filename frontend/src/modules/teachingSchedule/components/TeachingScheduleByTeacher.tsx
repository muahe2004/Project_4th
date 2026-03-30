import { useEffect, useMemo, useState } from "react";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import Loading from "../../../components/Loading/Loading";
import RoomScheduleGrid from "./RoomScheduleGrid";
import { useGetTeachersWithLearningSchedules } from "../apis/getTeachersWithLearningSchedules";
import type {
  ITeacherWithLearningSchedules,
  ITeachingScheduleWithRelations,
} from "../types";
import { getWeekDateRange } from "../../../utils/date/weekRange";
import "./styles/TeachingScheduleByRoom.css";

interface TeacherGroup {
  teacherKey: string;
  teacherLabel: string;
  scheduleMap: Map<string, ITeachingScheduleWithRelations[]>;
}

function getWeekDay(dateValue: string): number {
  const date = new Date(dateValue);
  return date.getDay();
}

function mapTeacherLabel(teacher: ITeacherWithLearningSchedules["teacher_information"]): string {
  return teacher.name?.trim() || "Chưa gán giảng viên";
}

function getPeriodRange(item: ITeachingScheduleWithRelations): number[] {
  const start = item.learning_schedule.start_period;
  const end = item.learning_schedule.end_period;
  const from = Math.max(1, Math.min(12, start));
  const to = Math.max(1, Math.min(12, end));
  if (to < from) {
    return [from];
  }
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function toTeacherGroups(data: ITeacherWithLearningSchedules[]): TeacherGroup[] {
  return data.map((teacher) => {
    const teacherLabel = mapTeacherLabel(teacher.teacher_information);
    const scheduleMap = new Map<string, ITeachingScheduleWithRelations[]>();

    teacher.teaching_schedules.forEach((item) => {
      const day = getWeekDay(item.learning_schedule.date);
      if (day < 0 || day > 6) {
        return;
      }

      getPeriodRange(item).forEach((period) => {
        const key = `${day}-${period}`;
        const existing = scheduleMap.get(key) ?? [];
        existing.push(item);
        scheduleMap.set(key, existing);
      });
    });

    return {
      teacherKey: teacher.teacher_information.id,
      teacherLabel,
      scheduleMap,
    };
  });
}

interface TeachingScheduleByTeacherProps {
  search?: string;
  status?: string;
  selectedDate: Date;
}

export function TeachingScheduleByTeacher({
  search,
  status,
  selectedDate,
}: TeachingScheduleByTeacherProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setPage(1);
  }, [search, status, selectedDate]);

  const dateRange = useMemo(() => getWeekDateRange(selectedDate), [selectedDate]);

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
    ...dateRange,
  };

  const {
    data: teacherSchedules,
    isLoading,
  } = useGetTeachersWithLearningSchedules(params);

  const teacherGroups = useMemo(
    () => toTeacherGroups(teacherSchedules?.data ?? []),
    [teacherSchedules?.data]
  );

  if (isLoading) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        <Loading />
      </div>
    );
  }

  if (teacherGroups.length === 0) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        Không có giảng viên nào để hiển thị
      </div>
    );
  }

  return (
    <div className="teaching-schedule-by-room-layout">
      <section className="teaching-schedule-by-room">
        {teacherGroups.map((group, index) => (
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
          totalItems={teacherSchedules?.total ?? 0}
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
