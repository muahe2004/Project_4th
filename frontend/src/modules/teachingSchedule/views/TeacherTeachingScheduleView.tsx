import { useState } from "react";

import TeachingScheduleCalender from "../components/TeachingScheduleCalender";
import WeekPicker from "../../../components/WeekPicker/WeekPicker";

import "../../learningSchedule/views/styles/learningSchedule.css";

export function TeacherTeachingScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <main className="learningSchedule">
      <WeekPicker selectedDate={selectedDate} onChangeDate={setSelectedDate} />
      <TeachingScheduleCalender selectedDate={selectedDate} />
    </main>
  );
}

export default TeacherTeachingScheduleView;
