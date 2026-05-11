import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useTranslation } from "react-i18next";

import getGradeColor from "../utils/gradesColor";
import type { ScoresTableProps } from "../types";

import "./styles/studentTableScore.css";

function formatScore(value: number | null, digits = 2): string {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

export function ScoresTable({ rows, editable = false, onEditRow }: ScoresTableProps) {
  const { t } = useTranslation();
  const showActions = editable && typeof onEditRow === "function";
  const lastColumnLabel = showActions ? t("grades.table.actions") : t("grades.table.note");

  return (
    <Box className="grades-student__information">
      <TableContainer className="primary-table-container" component={Paper}>
        <Table className="primary-table" aria-label="scores table">
          <TableHead className="primary-thead">
            <TableRow className="primary-trow">
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">{t("grades.table.index")}</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">{t("grades.table.subjectCode")}</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">{t("grades.table.subjectName")}</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">{t("grades.table.credits")}</TableCell>
              <TableCell className="primary-thead__cell" rowSpan={2} align="center">{t("grades.table.weight")}</TableCell>

              <TableCell className="primary-thead__cell" colSpan={3} align="center">{t("grades.table.componentScores")}</TableCell>
              <TableCell className="primary-thead__cell" colSpan={3} align="center">{t("grades.table.retakeScores")}</TableCell>
              <TableCell className="primary-thead__cell" colSpan={3} align="center">{t("grades.table.average")}</TableCell>

              <TableCell className="primary-thead__cell" rowSpan={2} align="center">
                {lastColumnLabel}
              </TableCell>
            </TableRow>

            <TableRow className="primary-trow">
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.d1")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.d2")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.final")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.d1")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.d2")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.final")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.scale10")}</TableCell>
              <TableCell className="primary-thead__cell" align="center">{t("grades.table.scale4")}</TableCell>
              <TableCell className="primary-thead__cell thead-cell__border--right" align="center">{t("grades.table.letterGrade")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody className="primary-tbody">
            {rows.length === 0 ? (
              <TableRow className="primary-trow">
                <TableCell className="primary-tcell" colSpan={15} align="center">
                  {t("grades.messages.noData")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.key} className="primary-trow">
                  <TableCell className="primary-tcell" align="center">{row.index}</TableCell>
                  <TableCell className="primary-tcell" align="center">{row.subject_code}</TableCell>
                  <TableCell className="primary-tcell" align="left">{row.subject_name}</TableCell>
                  <TableCell className="primary-tcell" align="center">{row.credits}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.weight)}</TableCell>

                  <TableCell className="primary-tcell" align="center">{formatScore(row.exam1)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.exam2)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.exam3)}</TableCell>

                  <TableCell className="primary-tcell" align="center">{formatScore(row.recheck1)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.recheck2)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.recheck3)}</TableCell>

                  <TableCell className="primary-tcell" align="center">{formatScore(row.avg10)}</TableCell>
                  <TableCell className="primary-tcell" align="center">{formatScore(row.avg4)}</TableCell>
                  <TableCell
                    className={`primary-tcell ${getGradeColor(row.grade)}`}
                    align="center"
                  >
                    {row.grade}
                  </TableCell>
                  {showActions ? (
                    <TableCell className="primary-tcell" align="center">
                      <IconButton
                        className="primary-tcell__button--icon"
                        onClick={() => onEditRow(row)}
                        aria-label="Edit score"
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </TableCell>
                  ) : (
                    <TableCell className="primary-tcell tcell-note" align="center">
                      {row.note}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ScoresTable;
