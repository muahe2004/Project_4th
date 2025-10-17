import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
} from "@mui/material";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { getStatusDisplay } from "../../../../utils/status/status-display";
import { getStatusColor } from "../../../../utils/status/status-color";
import type { ILectures } from "../../types";
import PaginationUniCore from "../../../../components/Pagination/Pagination";

interface LectureTableProps {
    lectures?: { data: ILectures[]; pagination?: { totalItems: number } };
    onEdit: (lecture: ILectures) => void;
    onDelete: (lecture: ILectures) => void;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
}

export const LecturesTable: React.FC<LectureTableProps> = ({
    lectures,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete,
}) => {
    return (
        <>
            <TableContainer className="sticky-table-container" component={Paper}>
                <Table stickyHeader className="sticky-table" aria-label="courses table">
                    <TableHead className="primary-thead">
                        <TableRow className="primary-trow">
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                Tên bài học
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Trạng thái
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody className="sticky-tbody">
                        {lectures?.data?.length ? (
                            lectures.data.map((row) => (
                                <TableRow key={row.id} className="sticky-trow">
                                    <TableCell className="sticky-tcell" align="left">
                                        {row.tenBaiHoc}
                                    </TableCell>

                                    <TableCell
                                        className="sticky-tcell"
                                        align="center"
                                        sx={{ color: getStatusColor(row.trangThai) }}
                                    >
                                        {getStatusDisplay(row.trangThai)}
                                    </TableCell>

                                    <TableCell className="sticky-tcell" align="center">
                                        <IconButton
                                            className="primary-tcell__button--icon"
                                            onClick={() => onEdit(row)}
                                        >
                                            <EditSquareIcon />
                                        </IconButton>

                                        <IconButton
                                            className="primary-tcell__button--icon primary-tcell__button--delete"
                                            onClick={() => onDelete(row)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Không có dữ liệu chương học
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <PaginationUniCore
                totalItems={lectures?.pagination?.totalItems || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
            />
        </>
    );
};