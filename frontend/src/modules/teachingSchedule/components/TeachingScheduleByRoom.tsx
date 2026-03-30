import { useEffect, useMemo, useState } from "react";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import Loading from "../../../components/Loading/Loading";
import RoomScheduleGrid from "./RoomScheduleGrid";
import { useGetRoomsWithLearningSchedules } from "../apis/getRoomsWithLearningSchedules";
import type {
  IRoomWithLearningSchedules,
  ITeachingScheduleWithRelations,
} from "../types";
import { getWeekDateRange } from "../../../utils/date/weekRange";
import "./styles/TeachingScheduleByRoom.css";

interface RoomGroup {
  roomKey: string;
  roomLabel: string;
  scheduleMap: Map<string, ITeachingScheduleWithRelations[]>;
}

function getWeekDay(dateValue: string): number {
  const date = new Date(dateValue);
  return date.getDay();
}

function mapRoomLabel(room: IRoomWithLearningSchedules["room_information"]): string {
  return String(room.room_number);
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

function toRoomGroups(data: IRoomWithLearningSchedules[]): RoomGroup[] {
  return data.map((room) => {
    const roomLabel = mapRoomLabel(room.room_information);
    const scheduleMap = new Map<string, ITeachingScheduleWithRelations[]>();

    room.teaching_schedules.forEach((item) => {
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
      roomKey: room.room_information.id,
      roomLabel,
      scheduleMap,
    };
  });
}

interface TeachingScheduleByRoomProps {
  search?: string;
  status?: string;
  selectedDate: Date;
}

export function TeachingScheduleByRoom({
  search,
  status,
  selectedDate,
}: TeachingScheduleByRoomProps) {
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
    data: roomSchedules,
    isLoading,
  } = useGetRoomsWithLearningSchedules(params);

  const roomGroups = useMemo(
    () => toRoomGroups(roomSchedules?.data ?? []),
    [roomSchedules?.data]
  );

  if (isLoading) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        <Loading />
      </div>
    );
  }

  if (roomGroups.length === 0) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        Không có phòng nào để hiển thị
      </div>
    );
  }

  return (
    <div className="teaching-schedule-by-room-layout">
      <section className="teaching-schedule-by-room">
        {roomGroups.map((group, index) => (
          <RoomScheduleGrid
            key={group.roomKey}
            roomLabel={group.roomLabel}
            scheduleMap={group.scheduleMap}
            showHeader={index === 0}
          />
        ))}
      </section>

      <div className="teaching-schedule-by-room__pagination">
        <PaginationUniCore
          totalItems={roomSchedules?.total ?? 0}
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

export default TeachingScheduleByRoom;
