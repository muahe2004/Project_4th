


import { useState } from "react";
import { useTranslation } from "react-i18next";
import WeekPicker from "../../../components/WeekPicker/WeekPicker";
import ExaminationScheduleCalendar from "../components/ExaminationScheduleCalendar";
import { useAuthStore } from "../../../stores/useAuthStore";

import "../../learningSchedule/views/styles/learningSchedule.css";
import "./styles/ExaminationSchedules.css";

export function StudentExaminationSchedules() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <main className="learningSchedule">
      <h1 className="primary-title">{t("examinationSchedules.breadcrumb.title")}</h1>
      <div style={{ marginBottom: 10 }}>
        <WeekPicker selectedDate={selectedDate} onChangeDate={setSelectedDate} />
      </div>
      <ExaminationScheduleCalendar selectedDate={selectedDate} studentId={user?.id} />
    </main>
  );
}

export default StudentExaminationSchedules;
