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
import { useTranslation } from "react-i18next";
import type { PredictIntentResponse } from "../apis/predictIntent";
import { COMPONENT_TYPE_FINAL_ALIASES, COMPONENT_TYPE_MIDDLE_ALIASES } from "../../grades/types";
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
  const { t } = useTranslation();
  const normalizedIntent = String(meta?.intent ?? "").trim().toLowerCase();

  if (!meta?.service_name || !Array.isArray(meta.service_data) || meta.service_data.length === 0) {
    return null;
  }
  if (normalizedIntent === "out_of_scope") {
    return null;
  }

  const serviceData = meta.service_data as Array<Record<string, unknown>>;

  if (meta.service_name === "ScoresServices") {
    const payload = serviceData[0] as {
      student_info?: { student_code?: string; name?: string };
      scores?: { items?: Array<Record<string, unknown>>; total?: number };
    };
    const scoreItems = payload.scores?.items ?? [];
    const rowsMap = new Map<
      string,
      {
        subjectName: string;
        term: string;
        d1: string;
        d2: string;
        thi: string;
      }
    >();
    const middleAliases = new Set(COMPONENT_TYPE_MIDDLE_ALIASES.map((item) => item.toUpperCase().trim()));
    const finalAliases = new Set(COMPONENT_TYPE_FINAL_ALIASES.map((item) => item.toUpperCase().trim()));
    const middleCandidates = new Map<string, Array<{ createdAt: number; score: string }>>();

    scoreItems.forEach((item) => {
      const subjectId = String(item.subject_id ?? "");
      const termText = `${String(item.academic_year ?? "")}${item.semester ? ` - ${t("umsChatbot.labels.semesterShort")} ${String(item.semester)}` : ""}`;
      const key = `${subjectId}-${termText}`;
      if (!rowsMap.has(key)) {
        rowsMap.set(key, {
          subjectName: String(item.subject_name ?? t("umsChatbot.labels.subject")),
          term: termText,
          d1: "-",
          d2: "-",
          thi: "-",
        });
        middleCandidates.set(key, []);
      }
      const row = rowsMap.get(key);
      if (!row) return;
      const componentType = String(
        item.score_component && typeof item.score_component === "object"
          ? (item.score_component as Record<string, unknown>).component_type ?? ""
          : ""
      )
        .trim()
        .toUpperCase();
      const scoreValue = String(item.score ?? "-");
      if (finalAliases.has(componentType)) {
        row.thi = scoreValue;
      } else if (middleAliases.has(componentType)) {
        const createdAt = new Date(String(item.created_at ?? "")).getTime();
        middleCandidates.get(key)?.push({ createdAt, score: scoreValue });
      }
    });
    middleCandidates.forEach((values, key) => {
      const row = rowsMap.get(key);
      if (!row || values.length === 0) return;
      const sorted = [...values].sort((a, b) => a.createdAt - b.createdAt);
      row.d1 = sorted[0]?.score ?? "-";
      row.d2 = sorted[1]?.score ?? "-";
    });
    const scoreRows = Array.from(rowsMap.values());

    return (
      <Stack spacing={1}>
        <TableContainer component={Paper} className="sticky-table-container chat-response-data__table-wrap">
          <Table stickyHeader size="small" className="sticky-table">
            <TableHead className="primary-thead">
              <TableRow className="primary-trow">
                <TableCell className="primary-thead__cell" align="center">{t("umsChatbot.labels.subject")}</TableCell>
                <TableCell className="primary-thead__cell" align="center">D1</TableCell>
                <TableCell className="primary-thead__cell" align="center">D2</TableCell>
                <TableCell className="primary-thead__cell" align="center">Thi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="sticky-tbody">
              {scoreRows.slice(0, 8).map((row, index) => (
                <TableRow key={`${row.subjectName}-${row.term}-${index}`} className="sticky-trow">
                  <TableCell className="sticky-tcell chat-response-data__td" align="left">
                    {row.subjectName}
                  </TableCell>
                  <TableCell className="sticky-tcell chat-response-data__td" align="center">
                    {row.d1}
                  </TableCell>
                  <TableCell className="sticky-tcell chat-response-data__td" align="center">
                    {row.d2}
                  </TableCell>
                  <TableCell className="sticky-tcell chat-response-data__td" align="center">
                    {row.thi}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                  {String(subject.subject_name ?? t("umsChatbot.labels.schedule"))}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {String(learningSchedule.date ?? "")}
                </Typography>
                <Typography variant="body2">
                  {t("umsChatbot.labels.period")}: {String(learningSchedule.start_period ?? "-")} - {String(learningSchedule.end_period ?? "-")}
                </Typography>
                <Typography variant="body2">
                  {t("umsChatbot.labels.room")}: {String(room.room_number ?? "-")} · {t("umsChatbot.labels.class")}: {String(classInfo.class_name ?? "-")}
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
          {t("umsChatbot.labels.examRecords", { count: items.length })}
        </Typography>
        <Stack spacing={0.75}>
          {items.slice(0, 4).map((item, index) => (
            <Box
              key={`${String(item.id ?? index)}-${index}`}
              className="chat-response-data__card"
            >
              <Typography variant="body2" fontWeight={600}>
                {String(item.subject_info && typeof item.subject_info === "object" ? (item.subject_info as Record<string, unknown>).subject_name ?? t("umsChatbot.labels.exam") : t("umsChatbot.labels.exam"))}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {String(item.date ?? "")}
              </Typography>
              <Typography variant="body2">
                {t("umsChatbot.labels.time")}: {String(item.start_time ?? "-")} - {String(item.end_time ?? "-")}
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
