import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { Box } from "@mui/material";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import TeachingSchedulesTable from "../components/TeachingSchedulesTable";
import Button from "../../../components/Button/Button";
import TeachingSchedulesFormModel from "../components/TeachingSchedulesFormModel";
import { useImportCalender } from "../apis/importCalender";
import { useUploadCalender } from "../apis/uploadCalender";
import { useExportExampleFile } from "../apis/exportExampleFile";
import ImportFormModel from "../components/ImportFormModel";
import type { ITeachingScheduleResponse, IUploadTeachingCalenderResponse } from "../types";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import MiniCalender from "../../courseRegistration/components/MiniCalender";
import RoomFilter from "../components/RoomFilter";
import "./styles/TeachingSchedules.css";

export function TeachingSchedules() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedTeachingSchedule, setSelectedTeachingSchedule] = useState<
    ITeachingScheduleResponse | undefined
  >(undefined);
  const [importPreview, setImportPreview] = useState<IUploadTeachingCalenderResponse | null>(null);
  const [openImportFormModel, setOpenImportFormModel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: uploadCalenderFile, isPending: isUploadingCalenderFile } = useUploadCalender({});
  const { mutateAsync: importCalender, isPending: isImportingCalender } = useImportCalender({});
  const { mutateAsync: exportExampleFile, isPending: isExportingExampleFile } = useExportExampleFile({});

  const handleOpenAddForm = () => {
    setFormMode("add");
    setSelectedTeachingSchedule(undefined);
    setOpenForm(true);
  };

  const handleOpenImportFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleOpenEditForm = (teachingSchedule: ITeachingScheduleResponse) => {
    setFormMode("edit");
    setSelectedTeachingSchedule(teachingSchedule);
    setOpenForm(true);
  };

  const handleImportCalenderFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      const uploadedResult = await uploadCalenderFile(selectedFile);
      setImportPreview(uploadedResult);
      setOpenImportFormModel(true);
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? t("teachingSchedules.errors.uploadFailed");
      showSnackbar(detail, "error");
      setImportPreview(null);
      setOpenImportFormModel(false);
    } finally {
      event.target.value = "";
    }
  };


  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="students-breadcrumb"
        items={[
          { label: t("teachingSchedules.breadcrumb.dashboard"), to: dashBoardUrl },
          { label: t("teachingSchedules.breadcrumb.title") },
        ]}
      />

      <Box className="admin-main-box">
        <SearchEngine
          placeholder={t("teachingSchedules.searchPlaceholder")}
          onSearch={(value) => {
            setSearch(value);
          }}
        />

        <Button
            onClick={handleOpenAddForm}
            className="btn-spacing-left"
        >
            {t("teachingSchedules.addSchedule")}
        </Button>

        <Button
            className="btn-spacing-left"
            onClick={handleOpenImportFilePicker}
            disabled={isUploadingCalenderFile}
        >
            {isUploadingCalenderFile ? t("teachingSchedules.uploading") : t("teachingSchedules.importSchedule")}
        </Button>
        <Button
            className="btn-spacing-left"
            onClick={() => {
              void exportExampleFile();
            }}
            disabled={isExportingExampleFile}
        >
            {isExportingExampleFile ? t("teachingSchedules.exporting") : t("teachingSchedules.exportFile")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={handleImportCalenderFile}
        />
      </Box>

      <Box className="teaching-schedules__layout">
        <Box className="teaching-schedules__sidebar">
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

        <Box className="teaching-schedules__main">
          <TeachingSchedulesTable
            selectedDate={selectedDate}
            search={search}
            roomId={selectedRoomId}
            onEdit={handleOpenEditForm}
          />
        </Box>
      </Box>

      <TeachingSchedulesFormModel
        open={openForm}
        mode={formMode}
        initialValues={selectedTeachingSchedule}
        onClose={() => {
          setOpenForm(false);
          setSelectedTeachingSchedule(undefined);
        }}
      />

      <ImportFormModel
        open={openImportFormModel}
        onClose={() => {
          setOpenImportFormModel(false);
          setImportPreview(null);
        }}
        data={importPreview}
        isImporting={isImportingCalender}
        onImport={async (payload) => {
          try {
            await importCalender(payload);
            showSnackbar(t("teachingSchedules.messages.importSuccess"), "success");
            setOpenImportFormModel(false);
            setImportPreview(null);
          } catch (error: any) {
            const detail = error?.response?.data?.detail ?? error?.data?.detail ?? t("teachingSchedules.errors.importFailed");
            showSnackbar(detail, "error");
          }
        }}
      />
    </main>
  );
}

export default TeachingSchedules;
