import { useState } from "react";
import { Box } from "@mui/material";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import { STATUS_OPTIONS } from "../../../constants/status";
import { dashBoardUrl } from "../../../routes/urls";
import { useDeleteRoom } from "../apis/deleteRoom";
import { useGetRooms } from "../apis/getRooms";
import RoomFormModel from "../components/RoomFormModel";
import RoomTable from "../components/RoomTable";
import type { IRoom } from "../types";

export function Rooms() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>(undefined);

  const { showSnackbar } = useSnackbar();
  const deleteRoomMutation = useDeleteRoom({});

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
  };

  const { data: rooms, isLoading, refetch } = useGetRooms(params);

  const handleDeleteRoom = (room?: IRoom) => {
    if (!room?.id) {
      showSnackbar("Không tìm thấy mã phòng để xoá", "error");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xoá phòng này không?")) {
      return;
    }

    deleteRoomMutation.mutate(room.id, {
      onSuccess: (response) => {
        showSnackbar(response?.message ?? "Xoá phòng thành công", "success");
        void refetch();
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail ?? "Xoá phòng thất bại";
        showSnackbar(detail, "error");
      },
    });
  };

  if (isLoading) {
    return (
      <main className="admin-main-container">
        <Loading />
      </main>
    );
  }

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="rooms-breadcrumb"
        items={[
          { label: "Dashboard", to: dashBoardUrl },
          { label: "Rooms" },
        ]}
      />

      <Box className="admin-main-box">
        <StatusFilter
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />

        <SearchEngine
          placeholder="Tìm theo số phòng, loại phòng..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Button
          onClick={() => {
            setMode("add");
            setSelectedRoom(undefined);
            setOpen(true);
          }}
          className="btn-spacing-left"
        >
          Add Room
        </Button>
      </Box>

      <RoomTable
        rooms={rooms}
        onEdit={(room) => {
          setMode("edit");
          setSelectedRoom(room);
          setOpen(true);
        }}
        onDelete={handleDeleteRoom}
      />

      <PaginationUniCore
        totalItems={rooms?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(currentPage) => setPage(currentPage)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
      />

      <RoomFormModel
        open={open}
        mode={mode}
        initialValues={selectedRoom}
        onClose={() => setOpen(false)}
      />
    </main>
  );
}
