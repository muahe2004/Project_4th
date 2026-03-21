import { useState } from "react";
import LearningScheduleCalender from "../components/LearningScheduleCalender";
import WeekPicker from "../components/WeekPicker";

import "./styles/learningSchedule.css";

export function LearningSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <main className="learningSchedule">
      <WeekPicker selectedDate={selectedDate} onChangeDate={setSelectedDate} />
      <LearningScheduleCalender selectedDate={selectedDate} />
    </main>
  );
}

export default LearningSchedule;
