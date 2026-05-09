import { useMemo, useState } from "react";
import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRoomDropDown } from "../apis/getRoomDropDown";
import type { IRoomDropDown } from "../types";
import "./styles/RoomFilter.css";

interface RoomFilterProps {
  selectedRoomId?: string;
  onChangeRoomId: (roomId?: string) => void;
}

function getRoomLabel(room: IRoomDropDown): string {
  return `Phòng ${room.room_number}`;
}

export function RoomFilter({ selectedRoomId, onChangeRoomId }: RoomFilterProps) {
  const [search, setSearch] = useState("");
  const { data: rooms } = useRoomDropDown({
    limit: 100,
    skip: 0,
    status: "active",
  });

  const roomItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allRooms = rooms ?? [];

    if (!query) {
      return allRooms;
    }

    return allRooms.filter((room) =>
      `phòng ${room.room_number}`.toLowerCase().includes(query)
    );
  }, [rooms, search]);

  return (
    <Box className="room-filter">
      <Box className="room-filter__header">
        <Box className="room-filter__search-icon">
          <SearchIcon />
        </Box>
        <InputBase
          className="room-filter__search"
          placeholder="Tìm phòng..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Box>

      <Box className="room-filter__divider" />

      <Box className="room-filter__list">
        {roomItems.map((room) => {
          const active = room.id === selectedRoomId;

          return (
            <button
              key={room.id}
              type="button"
              className={`room-filter__item${active ? " room-filter__item--active" : ""}`}
              onClick={() => onChangeRoomId(active ? undefined : room.id)}
            >
              {getRoomLabel(room)}
            </button>
          );
        })}
      </Box>
    </Box>
  );
}

export default RoomFilter;
