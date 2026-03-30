// import { useMemo } from "react";
// import dayjs from "dayjs";

// import Loading from "../../../components/Loading/Loading";
// import { useGetExaminationSchedules } from "../apis/getExaminationSchedule";
// import type { IExaminationScheduleResponse } from "../types";
// import ExaminationBox from "./ExaminationBox";
// import "./styles/ExaminationScheduleCalender.css";

// const START_HOUR = 7;
// const END_HOUR = 20;
// const HOURS = Array.from(
//   { length: END_HOUR - START_HOUR + 1 },
//   (_, index) => index + START_HOUR
// );
// const DAY_HEIGHT = 60;
// const PIXELS_PER_MINUTE = 1;

// function addDays(date: Date, days: number): Date {
//   const nextDate = new Date(date);
//   nextDate.setDate(nextDate.getDate() + days);
//   return nextDate;
// }

// function getMonday(date: Date): Date {
//   const source = new Date(date);
//   const day = source.getDay();
//   const diff = day === 0 ? -6 : 1 - day;
//   source.setHours(0, 0, 0, 0);
//   source.setDate(source.getDate() + diff);
//   return source;
// }

// function isSameDay(left: Date, right: Date): boolean {
//   return (
//     left.getFullYear() === right.getFullYear() &&
//     left.getMonth() === right.getMonth() &&
//     left.getDate() === right.getDate()
//   );
// }

// function toMinutesOfDay(value: string): number {
//   const parsed = dayjs(value);
//   return parsed.hour() * 60 + parsed.minute();
// }

// function formatMinutes(totalMinutes: number): string {
//   const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
//   const minute = String(totalMinutes % 60).padStart(2, "0");
//   return `${hour}:${minute}`;
// }

// function clamp(value: number, min: number, max: number): number {
//   return Math.max(min, Math.min(max, value));
// }

// interface ExaminationScheduleCalenderProps {
//   selectedDate: Date;
//   search?: string;
//   status?: string;
// }

// export function ExaminationScheduleCalender({
//   selectedDate,
//   search,
//   status,
// }: ExaminationScheduleCalenderProps) {
//   const monday = useMemo(() => getMonday(selectedDate), [selectedDate]);
//   const weekDays = useMemo(
//     () => Array.from({ length: 7 }, (_, index) => addDays(monday, index)),
//     [monday]
//   );

//   const weekRange = useMemo(
//     () => ({
//       start_date: dayjs(monday).format("YYYY-MM-DD"),
//       end_date: dayjs(addDays(monday, 6)).format("YYYY-MM-DD"),
//     }),
//     [monday]
//   );

//   const params = useMemo(
//     () => ({
//       limit: 1000,
//       skip: 0,
//       ...(search && { search }),
//       ...(status && { status }),
//       ...weekRange,
//     }),
//     [search, status, weekRange]
//   );

//   const { data, isLoading } = useGetExaminationSchedules(params);

//   const rows = data?.data ?? [];
//   const weekData = useMemo(() => {
//     return rows.filter((item: IExaminationScheduleResponse) => {
//       const scheduleDate = dayjs(item.date).format("YYYY-MM-DD");
//       return weekDays.some((day) => dayjs(day).format("YYYY-MM-DD") === scheduleDate);
//     });
//   }, [rows, weekDays]);

//   const bodyHeight = HOURS.length * DAY_HEIGHT;

//   if (isLoading) {
//     return (
//       <main className="admin-main-container">
//         <Loading />
//       </main>
//     );
//   }

//   return (
//     <section className="examination-calender">
//       <div className="examination-calender__wrapper">
//         <div className="examination-calender__grid">
//           <div className="examination-calender__head examination-calender__head-nav">
//             <span>Tuần thi</span>
//           </div>

//           {weekDays.map((day) => (
//             <div className="examination-calender__head" key={day.toISOString()}>
//               <strong>
//                 {day.toLocaleDateString("vi-VN", {
//                   weekday: "long",
//                 })}
//               </strong>
//               <span>{dayjs(day).format("DD/MM")}</span>
//             </div>
//           ))}

//           <div className="examination-calender__time-column" style={{ height: bodyHeight }}>
//             {HOURS.map((hour) => (
//               <span
//                 key={hour}
//                 className="examination-calender__time-label"
//                 style={{ top: (hour - START_HOUR) * DAY_HEIGHT }}
//               >
//                 {String(hour).padStart(2, "0")}:00
//               </span>
//             ))}
//             <div className="examination-calender__hour-line" style={{ top: bodyHeight }} />
//           </div>

//           {weekDays.map((day) => {
//             const events = weekData
//               .filter((item) => dayjs(item.date).format("YYYY-MM-DD") === dayjs(day).format("YYYY-MM-DD"))
//               .sort((left, right) =>
//                 dayjs(left.start_time).valueOf() - dayjs(right.start_time).valueOf()
//               );

//             return (
//               <div
//                 className="examination-calender__day-column"
//                 style={{ height: bodyHeight }}
//                 key={`${day.toISOString()}-content`}
//               >
//                 {HOURS.map((hour) => (
//                   <div
//                     key={hour}
//                     className="examination-calender__hour-line"
//                     style={{ top: (hour - START_HOUR) * DAY_HEIGHT }}
//                   />
//                 ))}
//                 <div className="examination-calender__hour-line" style={{ top: bodyHeight }} />

//                 {events.map((item) => {
//                   const startMinutes = toMinutesOfDay(item.start_time);
//                   const endMinutes = toMinutesOfDay(item.end_time);
//                   const visibleStart = clamp(startMinutes, START_HOUR * 60, END_HOUR * 60);
//                   const visibleEnd = clamp(endMinutes, visibleStart + 30, END_HOUR * 60);
//                   const top = (visibleStart - START_HOUR * 60) * PIXELS_PER_MINUTE + 2;
//                   const height = Math.max(
//                     44,
//                     (visibleEnd - visibleStart) * PIXELS_PER_MINUTE - 4
//                   );

//                   const invigilatorNames = item.invigilator
//                     .map((teacher) => teacher.invigilator_name)
//                     .filter(Boolean)
//                     .join(" - ");

//                   return (
//                     <div
//                       className="examination-calender__event"
//                       style={{ top, height }}
//                       key={item.id}
//                     >
//                       <ExaminationBox
//                         title={item.subject_info?.subject_name ?? "Lịch thi"}
//                         classText={
//                           item.class_info?.class_code
//                             ? `${item.class_info.class_code} - ${item.class_info.class_name ?? ""}`.trim()
//                             : item.class_info?.class_name ?? "Chưa có lớp"
//                         }
//                         timeText={`${formatMinutes(visibleStart)} - ${formatMinutes(visibleEnd)}`}
//                         roomText={
//                           item.room_info?.room_number
//                             ? `Phòng ${item.room_info.room_number}`
//                             : undefined
//                         }
//                         invigilatorText={invigilatorNames || undefined}
//                         status={item.status}
//                       />
//                     </div>
//                   );
//                 })}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ExaminationScheduleCalender;
