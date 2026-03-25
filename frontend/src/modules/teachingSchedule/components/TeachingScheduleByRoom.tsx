import { useMemo, useState } from "react";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import RoomScheduleGrid from "./RoomScheduleGrid";
import type { ITeachingScheduleResponse } from "../types";
import "./styles/TeachingScheduleByRoom.css";

interface TeachingScheduleByRoomProps {
  teachingSchedules?: {
    data: ITeachingScheduleResponse[];
    total: number;
  };
}

interface RoomGroup {
  roomKey: string;
  roomLabel: string;
  scheduleMap: Map<string, ITeachingScheduleResponse[]>;
}

const EXTRA_PREVIEW_ROOMS = 0;

function getWeekDay(dateValue: string): number {
  const date = new Date(dateValue);
  return date.getDay();
}

function mapRoomLabel(item: ITeachingScheduleResponse): string {
  const roomNumber = item.room?.room_number;
  if (roomNumber !== undefined && roomNumber !== null) {
    return `P${roomNumber}`;
  }
  return "Chưa gán phòng";
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

function toRoomGroups(data: ITeachingScheduleResponse[]): RoomGroup[] {
  const roomMap = new Map<string, RoomGroup>();

  data.forEach((item) => {
    const day = getWeekDay(item.learning_schedule.date);
    if (day < 0 || day > 6) {
      return;
    }

    const roomLabel = mapRoomLabel(item);
    const roomKey = item.room?.room_id ?? `room-${roomLabel}`;
    const current = roomMap.get(roomKey) ?? {
      roomKey,
      roomLabel,
      scheduleMap: new Map<string, ITeachingScheduleResponse[]>(),
    };

    getPeriodRange(item).forEach((period) => {
      const key = `${day}-${period}`;
      const existing = current.scheduleMap.get(key) ?? [];
      existing.push(item);
      current.scheduleMap.set(key, existing);
    });

    roomMap.set(roomKey, current);
  });

  return [...roomMap.values()].sort((left, right) =>
    left.roomLabel.localeCompare(right.roomLabel, "vi")
  );
}

function appendPreviewRooms(groups: RoomGroup[], count: number): RoomGroup[] {
  if (count <= 0) {
    return groups;
  }

  const usedLabels = new Set(groups.map((item) => item.roomLabel));
  const maxRoomNumber = groups.reduce((max, item) => {
    const matched = item.roomLabel.match(/^P(\d+)$/);
    if (!matched) {
      return max;
    }
    const value = Number(matched[1]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 200);

  const previewGroups: RoomGroup[] = [];
  let nextRoomNumber = maxRoomNumber + 1;

  while (previewGroups.length < count) {
    const roomLabel = `P${nextRoomNumber}`;
    if (!usedLabels.has(roomLabel)) {
      previewGroups.push({
        roomKey: `preview-${roomLabel}`,
        roomLabel,
        scheduleMap: new Map<string, ITeachingScheduleResponse[]>(),
      });
      usedLabels.add(roomLabel);
    }
    nextRoomNumber += 1;
  }

  return [...groups, ...previewGroups].sort((left, right) =>
    left.roomLabel.localeCompare(right.roomLabel, "vi")
  );
}

export function TeachingScheduleByRoom({
  teachingSchedules,
}: TeachingScheduleByRoomProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const roomGroups = useMemo(
    () =>
      appendPreviewRooms(
        toRoomGroups(teachingSchedules?.data ?? []),
        EXTRA_PREVIEW_ROOMS
      ),
    [teachingSchedules?.data]
  );

  const pagedGroups = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return roomGroups.slice(start, end);
  }, [roomGroups, page, rowsPerPage]);

  if (roomGroups.length === 0) {
    return (
      <div className="teaching-schedule-by-room teaching-schedule-by-room--empty">
        Không có lịch dạy để hiển thị theo phòng
      </div>
    );
  }

  return (
    <div className="teaching-schedule-by-room-layout">
      <section className="teaching-schedule-by-room">
        {pagedGroups.map((group, index) => (
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
          totalItems={roomGroups.length}
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
