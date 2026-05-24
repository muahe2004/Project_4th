
import { Button, Stack } from "@mui/material";
import "./styles/TimePicker.css";

export type ChatTimeScope = "tomorrow" | "this_week" | "next_week" | "this_month";

interface TimePickerProps {
  value?: ChatTimeScope | null;
  onChange: (timeScope: ChatTimeScope) => void;
  disabled?: boolean;
}

const TIME_SCOPE_OPTIONS: Array<{ value: ChatTimeScope; label: string }> = [
  { value: "tomorrow", label: "Ngày mai" },
  { value: "this_week", label: "Tuần này" },
  { value: "next_week", label: "Tuần sau" },
  { value: "this_month", label: "Tháng này" },
];

export default function TimePicker({ value, onChange, disabled = false }: TimePickerProps) {
  return (
    <Stack direction="row" spacing={1} className="time-picker">
      {TIME_SCOPE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="outlined"
          size="small"
          disabled={disabled}
          className="time-picker__button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </Stack>
  );
}
