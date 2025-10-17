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
import type { QuestionResponse } from "../../types";
import PaginationUniCore from "../../../../components/Pagination/Pagination";

interface LectureTableProps {
    questions?: { data: QuestionResponse[]; pagination?: { totalItems: number } };
    onEdit: (lecture: QuestionResponse) => void;
    onDelete: (lecture: QuestionResponse) => void;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
}

export const QuestionTable: React.FC<LectureTableProps> = ({
    questions,
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
                            <TableCell sx={{ width: "90%" }} className="primary-thead__cell department-name-tcell" align="center">
                                Nội dung câu hỏi
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody className="sticky-tbody">
                        {questions?.data?.length ? (
                            questions.data.map((row) => (
                                <TableRow key={row.id} className="sticky-trow">
                                    <TableCell className="sticky-tcell" align="left">
                                        {row.noiDung}
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
                totalItems={questions?.pagination?.totalItems || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
            />
        </>
    );
};