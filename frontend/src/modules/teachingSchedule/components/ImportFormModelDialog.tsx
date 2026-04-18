import { useEffect, useMemo, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import type { IUploadTeachingCalenderItem } from "../types";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { useSubjectDropDown } from "../apis/getSubjectDropDown";
import { useSubjectDropDownByIds } from "../apis/getSubjectDropDownByIds";
import { useRoomDropDown } from "../apis/getRoomDropDown";
import { useRoomDropDownByIds } from "../apis/getRoomDropDownByIds";
import { useTeacherDropdown } from "../../teachers/apis/getTeacherDropDown";
import { useTeacherDropdownByIds } from "../../teachers/apis/getTeacherDropDownByIds";

type EditableTeachingSchedule = IUploadTeachingCalenderItem & {
  subject_name?: string | null;
  teacher_name?: string | null;
  room_number?: number | null;
};

interface ImportFormModelDialogProps {
  open: boolean;
  onClose: () => void;
  initialSchedule: EditableTeachingSchedule | null;
  onSave: (schedule: IUploadTeachingCalenderItem) => void;
}

const defaultSchedule: EditableTeachingSchedule = {
  subject_id: null,
  subject_code: null,
  subject_name: null,
  teacher_id: null,
  teacher_code: null,
  teacher_name: null,
  weeekday: 2,
  room_id: null,
  room_number: null,
  lesson_periods: "",
  study_weeks: "",
};

const ImportFormModelDialog = ({
  open,
  onClose,
  initialSchedule,
  onSave,
}: ImportFormModelDialogProps) => {
  const [schedule, setSchedule] = useState<EditableTeachingSchedule>(defaultSchedule);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const { data: subjects = [] } = useSubjectDropDown({
    limit: 10,
    skip: 0,
    search: subjectSearch || undefined,
  });
  const { data: selectedSubjects = [] } = useSubjectDropDownByIds(
    selectedSubjectId ? { ids: [selectedSubjectId] } : { ids: [] }
  );
  const subjectOptions = useMemo(
    () => Array.from(new Map([...selectedSubjects, ...subjects].map((item) => [item.id, item])).values()),
    [selectedSubjects, subjects]
  );

  const { data: teachers = [] } = useTeacherDropdown({
    limit: 10,
    skip: 0,
    search: teacherSearch || undefined,
  });
  const { data: selectedTeachers = [] } = useTeacherDropdownByIds(
    selectedTeacherId ? { ids: [selectedTeacherId] } : { ids: [] }
  );
  const teacherOptions = useMemo(
    () => Array.from(new Map([...selectedTeachers, ...teachers].map((item) => [item.id, item])).values()),
    [selectedTeachers, teachers]
  );

  const { data: rooms = [] } = useRoomDropDown({
    limit: 10,
    skip: 0,
    search: roomSearch || undefined,
  });
  const { data: selectedRooms = [] } = useRoomDropDownByIds(
    selectedRoomId ? { ids: [selectedRoomId] } : { ids: [] }
  );
  const roomOptions = useMemo(
    () => Array.from(new Map([...selectedRooms, ...rooms].map((item) => [item.id, item])).values()),
    [selectedRooms, rooms]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSchedule(initialSchedule ?? defaultSchedule);
    setSelectedSubjectId(initialSchedule?.subject_id || "");
    setSelectedTeacherId(initialSchedule?.teacher_id || "");
    setSelectedRoomId(initialSchedule?.room_id || "");
    setSubjectSearch("");
    setTeacherSearch("");
    setRoomSearch("");
  }, [open, initialSchedule]);

  const syncSubject = (id: string) => {
    setSelectedSubjectId(id);
    const selected = subjectOptions.find((item) => item.id === id) ?? null;
    setSchedule((prev) => ({
      ...prev,
      subject_id: selected?.id ?? "",
      subject_code: selected?.subject_code ?? null,
      subject_name: selected?.name ?? null,
    }));
  };

  const syncTeacher = (id: string) => {
    setSelectedTeacherId(id);
    const selected = teacherOptions.find((item) => item.id === id) ?? null;
    setSchedule((prev) => ({
      ...prev,
      teacher_id: selected?.id ?? "",
      teacher_code: selected?.teacher_code ?? null,
      teacher_name: selected?.name ?? null,
    }));
  };

  const syncRoom = (id: string) => {
    setSelectedRoomId(id);
    const selected = roomOptions.find((item) => item.id === id) ?? null;
    setSchedule((prev) => ({
      ...prev,
      room_id: selected?.id ?? "",
      room_number: selected?.room_number ?? null,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="primary-dialog-title">Chỉnh sửa lịch dạy import</DialogTitle>
      <DialogContent dividers>
        <Box className="myprofile-form" sx={{ display: "grid", gap: 2 }}>
          <div>
            <LabelPrimary value="Mã môn học" required />
            <MainAutocomplete
              options={subjectOptions}
              value={selectedSubjectId || null}
              onChange={syncSubject}
              onSearchChange={setSubjectSearch}
              getOptionLabel={(option) =>
                option.subject_code ? `${option.subject_code} - ${option.name}` : option.name
              }
              getOptionId={(option) => option.id}
              placeholder="Chọn môn học"
            />
          </div>

          <div>
            <LabelPrimary value="Mã giảng viên" required />
            <MainAutocomplete
              options={teacherOptions}
              value={selectedTeacherId || null}
              onChange={syncTeacher}
              onSearchChange={setTeacherSearch}
              getOptionLabel={(option) =>
                option.teacher_code ? `${option.teacher_code} - ${option.name}` : option.name
              }
              getOptionId={(option) => option.id}
              placeholder="Chọn giảng viên"
            />
          </div>

          <div>
            <LabelPrimary value="Phòng" required />
            <MainAutocomplete
              options={roomOptions}
              value={selectedRoomId || null}
              onChange={syncRoom}
              onSearchChange={setRoomSearch}
              getOptionLabel={(option) => (option.room_number ? `Phòng ${option.room_number}` : "")}
              getOptionId={(option) => option.id}
              placeholder="Chọn phòng"
            />
          </div>

          <div>
            <LabelPrimary value="Thứ" required />
            <TextField
              value={schedule.weeekday}
              onChange={(event) =>
                setSchedule((prev) => ({
                  ...prev,
                  weeekday: Number(event.target.value),
                }))
              }
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>

          <div>
            <LabelPrimary value="Tiết học" required />
            <TextField
              value={schedule.lesson_periods}
              onChange={(event) => setSchedule((prev) => ({ ...prev, lesson_periods: event.target.value }))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>

          <div>
            <LabelPrimary value="Tuần học" required />
            <TextField
              value={schedule.study_weeks}
              onChange={(event) => setSchedule((prev) => ({ ...prev, study_weeks: event.target.value }))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">Huỷ</Button>
        <Button onClick={() => onSave(schedule)}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFormModelDialog;
