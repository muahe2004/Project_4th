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
import type { ICourses } from "../../types";
import PaginationUniCore from "../../../../components/Pagination/Pagination";

interface CourseTableProps {
    courses?: { data: ICourses[]; pagination?: { totalItems: number } };
    onEdit: (course: ICourses) => void;
    onDelete: (course: ICourses) => void;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
    courses,
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
                            <TableCell className="primary-thead__cell" align="center">
                                Mã khoá học
                            </TableCell>
                            <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                Tên khoá học
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Độ khó
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
                        {courses?.data?.length ? (
                            courses.data.map((row) => (
                                <TableRow key={row.id} className="sticky-trow">
                                    <TableCell className="sticky-tcell" align="center">
                                        {row.maKhoaHoc}
                                    </TableCell>

                                    <TableCell className="sticky-tcell" align="left">
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <img
                                                src={row.hinhAnh}
                                                alt={row.tenKhoaHoc}
                                                style={{
                                                    width: 70,
                                                    height: 40,
                                                    objectFit: "cover",
                                                    borderRadius: 4,
                                                }}
                                            />
                                            <span>{row.tenKhoaHoc}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="sticky-tcell" align="center">
                                        {row.doKho}
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
                                    Không có dữ liệu khóa học
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <PaginationUniCore
                totalItems={courses?.pagination?.totalItems || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
            />
        </>
    );
};