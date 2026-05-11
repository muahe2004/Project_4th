import { useState } from "react";
import { useTranslation } from "react-i18next";
import LearningScheduleCalender from "../components/LearningScheduleCalender";

import "./styles/learningSchedule.css";
import WeekPicker from "../../../components/WeekPicker/WeekPicker";

export function LearningSchedule() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <main className="learningSchedule">
      <h1 className="primary-title">{t("learningSchedule.title")}</h1>
      <WeekPicker selectedDate={selectedDate} onChangeDate={setSelectedDate} />
      <LearningScheduleCalender selectedDate={selectedDate} />
    </main>
  );
}

export default LearningSchedule;
