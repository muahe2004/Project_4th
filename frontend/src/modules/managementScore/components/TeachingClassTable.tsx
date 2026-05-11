import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useTranslation } from "react-i18next";

import type { ITeachingClassItem } from "../apis/getTeachingClasses";
import { teacherManagementListStudentScoreUrl } from "../../../routes/urls";

import "../../grades/components/styles/studentTableScore.css";

interface TeachingClassTableProps {
  rows?: ITeachingClassItem[];
  onViewClass?: (row: ITeachingClassItem) => void;
  academicTermId?: string;
}

export function TeachingClassTable({ rows, onViewClass, academicTermId }: TeachingClassTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewClass = (row: ITeachingClassItem) => {
    onViewClass?.(row);

    navigate(`/${teacherManagementListStudentScoreUrl}`, {
      state: {
        classId: row.id,
        subjectId: row.subject_id,
        academicTermId,
        classCode: row.class_code,
        className: row.class_name,
        subjectCode: row.subject_code,
        subjectName: row.subject_name,
      },
    });
  };

  return (
    <TableContainer className="primary-table-container" component={Paper}>
      <Table className="primary-table" aria-label="teaching class table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="left">{t("teacherManagementScore.table.classCode")}</TableCell>
            <TableCell className="primary-thead__cell" align="left">{t("teacherManagementScore.table.className")}</TableCell>
            <TableCell className="primary-thead__cell" align="left">{t("teacherManagementScore.table.subject")}</TableCell>
            <TableCell className="primary-thead__cell" align="center" sx={{ width: "5%", whiteSpace: "nowrap" }}>
              {t("teacherManagementScore.table.actions")}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody className="primary-tbody">
          {(rows ?? []).length === 0 ? (
            <TableRow className="primary-trow">
              <TableCell className="primary-tcell" colSpan={4} align="center">
                {t("teacherManagementScore.table.empty")}
              </TableCell>
            </TableRow>
          ) : (
            (rows ?? []).map((row) => (
              <TableRow key={`${row.id}-${row.subject_id}`} className="primary-trow">
                <TableCell className="primary-tcell" align="left">
                  {row.class_code}
                </TableCell>
                <TableCell className="primary-tcell" align="left">
                  {row.class_name}
                </TableCell>
                <TableCell className="primary-tcell" align="left">
                  {row.subject_name} ({row.subject_code})
                </TableCell>
              <TableCell className="primary-tcell" align="center" sx={{ width: "5%", whiteSpace: "nowrap" }}>
                  <IconButton
                    className="primary-tcell__button--icon"
                    aria-label="view class details"
                    onClick={() => handleViewClass(row)}
                  >
                    <VisibilityOutlinedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TeachingClassTable;
