import dayjs from "dayjs";

export function getWeekDateRange(selectedDate: Date) {
  const source = new Date(selectedDate);
  source.setHours(0, 0, 0, 0);

  const day = source.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(source);
  monday.setDate(source.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start_date: dayjs(monday).format("YYYY-MM-DD"),
    end_date: dayjs(sunday).format("YYYY-MM-DD"),
  };
}
