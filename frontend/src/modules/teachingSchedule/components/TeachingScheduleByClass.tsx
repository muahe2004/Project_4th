import { useEffect, useMemo, useState } from "react";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import Loading from "../../../components/Loading/Loading";
import RoomScheduleGrid from "./RoomScheduleGrid";
import { useGetClassesWithLearningSchedules } from "../apis/getClassesWithLearningSchedules";
import type {
  IClassWithLearningSchedules,
  ITeachingScheduleWithRelations,
} from "../types";
import { getWeekDateRange } from "../../../utils/date/weekRange";
import "./styles/TeachingScheduleByRoom.css";

interface ClassGroup {
  classKey: string;
  classLabel: string;
  scheduleMap: Map<string, ITeachingScheduleWithRelations[]>;
}

function getWeekDay(dateValue: string): number {
  const date = new Date(dateValue);
  return date.getDay();
}

function mapClassLabel(classInformation: IClassWithLearningSchedules["class_information"]): string {
  return classInformation.class_name?.trim() || "Chưa gán lớp";
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

function toClassGroups(data: IClassWithLearningSchedules[]): ClassGroup[] {
  return data.map((classItem) => {
    const classLabel = mapClassLabel(classItem.class_information);
    const scheduleMap = new Map<string, ITeachingScheduleWithRelations[]>();

    classItem.teaching_schedules.forEach((item) => {
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
      classKey: classItem.class_information.id,
      classLabel,
      scheduleMap,
    };
  });
}

interface TeachingScheduleByClassProps {
  search?: string;
  status?: string;
  selectedDate: Date;
}

export function TeachingScheduleByClass({
  search,
  status,
  selectedDate,
}: TeachingScheduleByClassProps) {
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
    data: classSchedules,
    isLoading,
  } = useGetClassesWithLearningSchedules(params);

  const classGroups = useMemo(
    () => toClassGroups(classSchedules?.data ?? []),
    [classSchedules?.data]
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
        {classGroups.map((group, index) => (
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
          totalItems={classSchedules?.total ?? 0}
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
