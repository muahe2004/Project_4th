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

import type { ITeachingClassItem } from "../apis/getTeachingClasses";

import "../../grades/components/styles/studentTableScore.css";

interface TeachingClassTableProps {
  rows?: ITeachingClassItem[];
}

export function TeachingClassTable({ rows }: TeachingClassTableProps) {
  return (
    <TableContainer className="primary-table-container" component={Paper}>
      <Table className="primary-table" aria-label="teaching class table">
        <TableHead className="primary-thead">
          <TableRow className="primary-trow">
            <TableCell className="primary-thead__cell" align="left">Mã lớp</TableCell>
            <TableCell className="primary-thead__cell" align="left">Tên lớp giảng dạy</TableCell>
            <TableCell className="primary-thead__cell" align="left">Môn giảng dạy</TableCell>
            <TableCell className="primary-thead__cell" align="center" sx={{ width: "5%", whiteSpace: "nowrap" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody className="primary-tbody">
          {(rows ?? []).length === 0 ? (
            <TableRow className="primary-trow">
              <TableCell className="primary-tcell" colSpan={4} align="center">
                Không có lớp giảng dạy
              </TableCell>
            </TableRow>
          ) : (
            (rows ?? []).map((row) => (
              <TableRow key={row.id} className="primary-trow">
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
                  <IconButton className="primary-tcell__button--icon" aria-label="view class details">
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
