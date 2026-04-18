import { useEffect, useMemo, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { useClassesDropDown } from "../../classes/apis/getClassDropDown";
import { useClassesDropDownByIds } from "../../classes/apis/getClassDropDownByIds";
import { useRoomDropDown } from "../../teachingSchedule/apis/getRoomDropDown";
import { useRoomDropDownByIds } from "../../teachingSchedule/apis/getRoomDropDownByIds";
import { useSubjectDropDown } from "../../teachingSchedule/apis/getSubjectDropDown";
import { useSubjectDropDownByIds } from "../../teachingSchedule/apis/getSubjectDropDownByIds";
import { useTeacherDropdown } from "../../teachers/apis/getTeacherDropDown";
import { useTeacherDropdownByIds } from "../../teachers/apis/getTeacherDropDownByIds";
import type { IImportExaminationScheduleItem } from "../types";

type EditableExaminationSchedule = IImportExaminationScheduleItem & {
  subject_code?: string | null;
  subject_name?: string | null;
  class_code?: string | null;
  class_name?: string | null;
  invigilator_1_code?: string | null;
  invigilator_1_name?: string | null;
  invigilator_2_code?: string | null;
  invigilator_2_name?: string | null;
  room_number?: number | null;
};

interface ImportFormModelDialogProps {
  open: boolean;
  onClose: () => void;
  initialSchedule: EditableExaminationSchedule | null;
  onSave: (schedule: EditableExaminationSchedule) => void;
}

const defaultSchedule: EditableExaminationSchedule = {
  subject_id: "",
  subject_code: "",
  subject_name: "",
  class_id: "",
  class_code: "",
  class_name: "",
  date: "",
  start_time: "",
  end_time: "",
  room_id: null,
  room_number: null,
  schedule_type: "",
  invigilator_1_code: "",
  invigilator_1_name: "",
  invigilator_1_id: null,
  invigilator_2_code: "",
  invigilator_2_name: "",
  invigilator_2_id: null,
};

const ImportFormModelDialog = ({
  open,
  onClose,
  initialSchedule,
  onSave,
}: ImportFormModelDialogProps) => {
  const [schedule, setSchedule] = useState<EditableExaminationSchedule>(defaultSchedule);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedTeacher1Id, setSelectedTeacher1Id] = useState("");
  const [selectedTeacher2Id, setSelectedTeacher2Id] = useState("");

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

  const { data: classes = [] } = useClassesDropDown({
    limit: 10,
    skip: 0,
    search: classSearch || undefined,
  });
  const { data: selectedClasses = [] } = useClassesDropDownByIds(
    selectedClassId ? { ids: [selectedClassId] } : { ids: [] }
  );
  const classOptions = useMemo(
    () => Array.from(new Map([...selectedClasses, ...classes].map((item) => [item.id, item])).values()),
    [selectedClasses, classes]
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

  const { data: teachers = [] } = useTeacherDropdown({
    limit: 10,
    skip: 0,
    search: teacherSearch || undefined,
  });
  const { data: selectedTeachers = [] } = useTeacherDropdownByIds(
    selectedTeacher1Id || selectedTeacher2Id
      ? {
          ids: [
            ...(selectedTeacher1Id ? [selectedTeacher1Id] : []),
            ...(selectedTeacher2Id ? [selectedTeacher2Id] : []),
          ],
        }
      : { ids: [] }
  );
  const teacherOptions = useMemo(
    () => Array.from(new Map([...selectedTeachers, ...teachers].map((item) => [item.id, item])).values()),
    [selectedTeachers, teachers]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSchedule(initialSchedule ?? defaultSchedule);
    setSelectedSubjectId(initialSchedule?.subject_id || "");
    setSelectedClassId(initialSchedule?.class_id || "");
    setSelectedRoomId(initialSchedule?.room_id || "");
    setSelectedTeacher1Id(initialSchedule?.invigilator_1_id || "");
    setSelectedTeacher2Id(initialSchedule?.invigilator_2_id || "");
    setSubjectSearch("");
    setClassSearch("");
    setRoomSearch("");
    setTeacherSearch("");
  }, [open, initialSchedule]);

  const syncSelectedSubject = (id: string) => {
    setSelectedSubjectId(id);
    const selected = subjectOptions.find((item) => item.id === id) ?? null;
    setSchedule((prev) => ({
      ...prev,
      subject_id: selected?.id ?? "",
      subject_code: selected?.subject_code ?? "",
      subject_name: selected?.name ?? "",
    }));
  };

  const syncSelectedClass = (id: string) => {
    setSelectedClassId(id);
    const selected = classOptions.find((item) => item.id === id) ?? null;
    setSchedule((prev) => ({
      ...prev,
      class_id: selected?.id ?? "",
      class_code: selected?.class_code ?? "",
      class_name: selected?.class_name ?? "",
    }));
  };

  const syncSelectedRoom = (id: string) => {
    setSelectedRoomId(id);
    const selected = roomOptions.find((item) => item.id === id) ?? null;
    setSchedule((prev) => ({
      ...prev,
      room_id: selected?.id ?? "",
      room_number: selected?.room_number ?? null,
    }));
  };

  const syncSelectedTeacher = (slot: 1 | 2, id: string) => {
    if (slot === 1) {
      setSelectedTeacher1Id(id);
    } else {
      setSelectedTeacher2Id(id);
    }
    const selected = teacherOptions.find((item) => item.id === id) ?? null;
    setSchedule((prev) => ({
      ...prev,
      [slot === 1 ? "invigilator_1_id" : "invigilator_2_id"]: selected?.id ?? "",
      [slot === 1 ? "invigilator_1_code" : "invigilator_2_code"]: selected?.teacher_code ?? "",
      [slot === 1 ? "invigilator_1_name" : "invigilator_2_name"]: selected?.name ?? "",
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="primary-dialog-title">Chỉnh sửa lịch thi import</DialogTitle>
      <DialogContent dividers>
        <Box className="myprofile-form" sx={{ display: "grid", gap: 2 }}>
          <div>
            <LabelPrimary value="Mã môn thi" required />
            <MainAutocomplete
              options={subjectOptions}
              value={selectedSubjectId || null}
              onChange={(id) => syncSelectedSubject(id)}
              onSearchChange={setSubjectSearch}
              getOptionLabel={(option) =>
                option.subject_code ? `${option.subject_code} - ${option.name}` : option.name
              }
              getOptionId={(option) => option.id}
              placeholder="Chọn môn thi"
            />
          </div>

          <div>
            <LabelPrimary value="Mã lớp" required />
            <MainAutocomplete
              options={classOptions}
              value={selectedClassId || null}
              onChange={(id) => syncSelectedClass(id)}
              onSearchChange={setClassSearch}
              getOptionLabel={(option) =>
                option.class_code ? `${option.class_code} - ${option.class_name ?? ""}`.trim() : option.class_name ?? ""
              }
              getOptionId={(option) => option.id}
              placeholder="Chọn lớp"
            />
          </div>

          <div>
            <LabelPrimary value="Giám thị 1" />
            <MainAutocomplete
              options={teacherOptions}
              value={selectedTeacher1Id || null}
              onChange={(id) => syncSelectedTeacher(1, id)}
              onSearchChange={setTeacherSearch}
              getOptionLabel={(option) =>
                option.teacher_code ? `${option.teacher_code} - ${option.name}` : option.name
              }
              getOptionId={(option) => option.id}
              placeholder="Chọn giám thị 1"
            />
          </div>

          <div>
            <LabelPrimary value="Giám thị 2" />
            <MainAutocomplete
              options={teacherOptions}
              value={selectedTeacher2Id || null}
              onChange={(id) => syncSelectedTeacher(2, id)}
              onSearchChange={setTeacherSearch}
              getOptionLabel={(option) =>
                option.teacher_code ? `${option.teacher_code} - ${option.name}` : option.name
              }
              getOptionId={(option) => option.id}
              placeholder="Chọn giám thị 2"
            />
          </div>

          <div>
            <LabelPrimary value="Phòng" />
            <MainAutocomplete
              options={roomOptions}
              value={selectedRoomId || null}
              onChange={(id) => syncSelectedRoom(id)}
              onSearchChange={setRoomSearch}
              getOptionLabel={(option) => (option.room_number ? `Phòng ${option.room_number}` : "")}
              getOptionId={(option) => option.id}
              placeholder="Chọn phòng"
            />
          </div>

          <div>
            <LabelPrimary value="Ngày thi" required />
            <TextField
              value={schedule.date || ""}
              onChange={(event) => setSchedule((prev) => ({ ...prev, date: event.target.value }))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>

          <div>
            <LabelPrimary value="Giờ bắt đầu" required />
            <TextField
              value={schedule.start_time || ""}
              onChange={(event) => setSchedule((prev) => ({ ...prev, start_time: event.target.value }))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>

          <div>
            <LabelPrimary value="Giờ kết thúc" required />
            <TextField
              value={schedule.end_time || ""}
              onChange={(event) => setSchedule((prev) => ({ ...prev, end_time: event.target.value }))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>

          <div>
            <LabelPrimary value="Loại" />
            <TextField
              value={schedule.schedule_type || ""}
              onChange={(event) => setSchedule((prev) => ({ ...prev, schedule_type: event.target.value || null }))}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">Huỷ</Button>
        <Button
          onClick={() => onSave(schedule)}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFormModelDialog;
