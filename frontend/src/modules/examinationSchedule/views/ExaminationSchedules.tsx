import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { Box } from "@mui/material";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import Button from "../../../components/Button/Button";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import MiniCalender from "../../courseRegistration/components/MiniCalender";
import RoomFilter from "../../teachingSchedule/components/RoomFilter";
import ExaminationScheduleFormModel from "../components/ExaminationScheduleFormModel";
import ExaminationScheduleCalendar from "../components/ExaminationScheduleCalendar";
import ImportFormModel from "../components/ImportFormModel";
import { useUploadExaminationSchedule } from "../apis/uploadExaminationSchedule";
import { useImportExaminationSchedule } from "../apis/importExaminationSchedule";
import type { IExaminationScheduleResponse, IUploadExaminationScheduleResponse } from "../types";
import "./styles/ExaminationSchedules.css";

export function ExaminationSchedules() {
  const { showSnackbar } = useSnackbar();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedExaminationSchedule, setSelectedExaminationSchedule] =
    useState<IExaminationScheduleResponse | undefined>(undefined);
  const [openImportFormModel, setOpenImportFormModel] = useState(false);
  const [importPreview, setImportPreview] = useState<IUploadExaminationScheduleResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: uploadExaminationScheduleFile, isPending: isUploadingExaminationScheduleFile } =
    useUploadExaminationSchedule({});
  const { mutateAsync: importExaminationSchedule, isPending: isImportingExaminationSchedule } =
    useImportExaminationSchedule({});

  const handleOpenImportFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImportExaminationScheduleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      const uploadedResult = await uploadExaminationScheduleFile(selectedFile);
      setImportPreview(uploadedResult);
      setOpenImportFormModel(true);
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? "Upload file lịch thi thất bại";
      showSnackbar(detail, "error");
      setImportPreview(null);
      setOpenImportFormModel(false);
    } finally {
      event.target.value = "";
    }
  };

  const handleOpenAddForm = () => {
    setMode("add");
    setSelectedExaminationSchedule(undefined);
    setOpenForm(true);
  };

  const handleOpenEditForm = (schedule: IExaminationScheduleResponse) => {
    setMode("edit");
    setSelectedExaminationSchedule(schedule);
    setOpenForm(true);
  };

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="students-breadcrumb"
        items={[
          { label: "Dashboard", to: dashBoardUrl },
          { label: "ExaminationSchedules" },
        ]}
      />

      <Box className="admin-main-box">
        <SearchEngine
          placeholder="Tìm theo lớp, môn, phòng..."
          onSearch={(val) => {
            setSearch(val);
          }}
        />

        <Button onClick={handleOpenAddForm} className="btn-spacing-left">
          Add Examination Schedule
        </Button>

        <Button
          onClick={handleOpenImportFilePicker}
          disabled={isUploadingExaminationScheduleFile}
          className="btn-spacing-left"
        >
          {isUploadingExaminationScheduleFile ? "Uploading..." : "Import lịch thi"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={handleImportExaminationScheduleFile}
        />
      </Box>

      <Box className="examination-schedules__layout">
        <Box className="examination-schedules__sidebar">
          <MiniCalender
            selectedDate={selectedDate}
            onChangeDate={(date) => {
              setSelectedDate(date);
            }}
          />
          <RoomFilter
            selectedRoomId={selectedRoomId}
            onChangeRoomId={setSelectedRoomId}
          />
        </Box>

        <Box className="examination-schedules__main">
          <ExaminationScheduleCalendar
            selectedDate={selectedDate}
            search={search}
            roomId={selectedRoomId}
            onEdit={handleOpenEditForm}
          />
        </Box>
      </Box>

      <ExaminationScheduleFormModel
        open={openForm}
        mode={mode}
        initialValues={selectedExaminationSchedule}
        onClose={() => setOpenForm(false)}
      />

      <ImportFormModel
        open={openImportFormModel}
        onClose={() => setOpenImportFormModel(false)}
        data={importPreview}
        isImporting={isImportingExaminationSchedule}
        onImport={async (payload) => {
          try {
            const response = await importExaminationSchedule(payload);
            showSnackbar(
              response?.items?.length
                ? `Import lịch thi thành công (${response.items.length} dòng)`
                : "Import lịch thi thành công",
              "success"
            );
            setOpenImportFormModel(false);
            setImportPreview(null);
          } catch (error: any) {
            const detail = error?.response?.data?.detail ?? "Import lịch thi thất bại";
            showSnackbar(detail, "error");
          }
        }}
      />
    </main>
  );
}

export default ExaminationSchedules;
