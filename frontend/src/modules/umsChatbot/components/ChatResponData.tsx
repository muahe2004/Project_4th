import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { PredictIntentResponse } from "../apis/predictIntent";
import "./styles/ChatResponData.css";

interface ChatResponDataProps {
  meta?: PredictIntentResponse;
}

const BASIC_COLUMNS_BY_INTENT: Record<string, string[]> = {
  department_info: ["department_code", "department_name", "established_date"],
  major_info: ["major_code", "major_name", "department_name"],
  specialization_info: ["specialization_code", "specialization_name", "major_name"],
  training_program_info: ["program_type", "training_program_name", "academic_year"],
  subject_info: ["subject_code", "subject_name", "credits"],
};

const COLUMN_ALIASES: Record<string, string[]> = {
  department_name: ["department_name", "department_info.department_name", "name"],
  major_name: ["major_name", "major_info.major_name", "major_infor.major_name", "name"],
  specialization_name: [
    "specialization_name",
    "specialization_info.specialization_name",
    "specialization_infor.specialization_name",
    "name",
  ],
  training_program_name: ["training_program_name", "name"],
  subject_code: ["subject_code", "code"],
  subject_name: ["subject_name", "name"],
  credits: ["credits", "credit", "number_of_credits", "subject_credit"],
};

function toDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function toLabel(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getNestedValue(source: Record<string, unknown>, path: string): unknown {
  if (!path.includes(".")) {
    return source[path];
  }
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, source);
}

function getValueByAliases(row: Record<string, unknown>, column: string): unknown {
  const candidates = COLUMN_ALIASES[column] ?? [column];
  for (const key of candidates) {
    const value = getNestedValue(row, key);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return row[column];
}

function hasValueForColumn(rows: Array<Record<string, unknown>>, column: string): boolean {
  return rows.some((row) => {
    const value = getValueByAliases(row, column);
    return value !== undefined && value !== null && value !== "";
  });
}

export default function ChatResponData({ meta }: ChatResponDataProps) {
  if (!meta?.service_name || !Array.isArray(meta.service_data) || meta.service_data.length === 0) {
    return null;
  }

  const serviceData = meta.service_data as Array<Record<string, unknown>>;

  if (meta.service_name === "ScoresServices") {
    const payload = serviceData[0] as {
      student_info?: { student_code?: string; name?: string };
      scores?: { items?: Array<Record<string, unknown>>; total?: number };
    };

    return (
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={700}>
          {payload.student_info?.name ?? "Student"} - {payload.student_info?.student_code ?? ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total records: {payload.scores?.total ?? 0}
        </Typography>
        <Stack spacing={0.75}>
          {(payload.scores?.items ?? []).slice(0, 4).map((item, index) => (
            <Box
              key={`${String(item.id ?? index)}-${index}`}
              className="chat-response-data__card"
            >
              <Typography variant="body2" fontWeight={600}>
                {String(item.subject_name ?? "Subject")}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {String(item.academic_year ?? "")}
                {item.semester ? ` · HK ${String(item.semester)}` : ""}
              </Typography>
              <Typography variant="body2">
                Score: {String(item.score ?? "-")} · Type: {String(item.score_type ?? "-")}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    );
  }

  if (meta.service_name === "TeachingScheduleServices") {
    const items = serviceData as Array<Record<string, unknown>>;
    return (
      <Stack spacing={1}>
        <Stack spacing={0.75}>
          {items.slice(0, 4).map((item, index) => {
            const learningSchedule = (item.learning_schedule as Record<string, unknown>) ?? {};
            const subject = (item.subject as Record<string, unknown>) ?? {};
            const room = (item.room as Record<string, unknown>) ?? {};
            const classInfo = (item.class as Record<string, unknown>) ?? {};
            return (
              <Box
                key={`${String(item.id ?? index)}-${index}`}
                className="chat-response-data__card"
              >
                <Typography variant="body2" fontWeight={600}>
                  {String(subject.subject_name ?? "Schedule")}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {String(learningSchedule.date ?? "")}
                </Typography>
                <Typography variant="body2">
                  Period: {String(learningSchedule.start_period ?? "-")} - {String(learningSchedule.end_period ?? "-")}
                </Typography>
                <Typography variant="body2">
                  Room: {String(room.room_number ?? "-")} · Class: {String(classInfo.class_name ?? "-")}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  if (meta.service_name === "ExaminationScheduleServices") {
    const items = serviceData as Array<Record<string, unknown>>;
    return (
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={700}>
          {items.length} exam record(s)
        </Typography>
        <Stack spacing={0.75}>
          {items.slice(0, 4).map((item, index) => (
            <Box
              key={`${String(item.id ?? index)}-${index}`}
              className="chat-response-data__card"
            >
              <Typography variant="body2" fontWeight={600}>
                {String(item.subject_info && typeof item.subject_info === "object" ? (item.subject_info as Record<string, unknown>).subject_name ?? "Exam" : "Exam")}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {String(item.date ?? "")}
              </Typography>
              <Typography variant="body2">
                Time: {String(item.start_time ?? "-")} - {String(item.end_time ?? "-")}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    );
  }

  const tableRows = serviceData.filter(
    (item) => item && typeof item === "object" && !Array.isArray(item)
  ) as Array<Record<string, unknown>>;
  if (tableRows.length > 0) {
    const normalizedIntent = String(meta.intent ?? "").trim().toLowerCase();
    const rowKeys = Object.keys(tableRows[0] ?? {});
    const mappedColumns = (BASIC_COLUMNS_BY_INTENT[normalizedIntent] ?? []).filter((key) =>
      hasValueForColumn(tableRows, key)
    );
    const columns = mappedColumns.length > 0 ? mappedColumns : rowKeys.slice(0, 4);

    return (
      <TableContainer component={Paper} className="sticky-table-container chat-response-data__table-wrap">
        <Table stickyHeader size="small" className="sticky-table">
          <TableHead className="primary-thead">
            <TableRow className="primary-trow">
              {columns.map((column) => (
                <TableCell key={column} className="primary-thead__cell" align="center">
                  {toLabel(column)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className="sticky-tbody">
            {tableRows.slice(0, 8).map((row, index) => (
              <TableRow key={`${String(row.id ?? index)}-${index}`} className="sticky-trow">
                {columns.map((column) => (
                  <TableCell
                    key={`${column}-${index}`}
                    className="sticky-tcell chat-response-data__td"
                    align={column.endsWith("_name") ? "left" : "center"}
                  >
                    {toDisplayValue(getValueByAliases(row, column))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box component="pre" className="chat-response-data__json">
      {JSON.stringify(serviceData, null, 2)}
    </Box>
  );
}
