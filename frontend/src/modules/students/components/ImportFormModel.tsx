import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";
import type {
    IStudentFileData,
    IStudentFileInvalidRow,
    IStudentUploadResponse,
} from "../types";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import ImportFormModelDialog from "./ImportFormModelDialog";

interface ImportFormModelProps {
    open: boolean;
    onClose: () => void;
    data: IStudentUploadResponse | null;
    onImport: (students: IStudentFileData[]) => Promise<void>;
    isImporting?: boolean;
}

type RowSource = "valid" | "invalid";

type ImportPreviewRow = IStudentFileData & {
    source: RowSource;
    row?: number;
    errors?: string[];
    index: number;
};

const formatDate = (dateValue?: string | null) => {
    if (!dateValue) {
        return "";
    }
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return dateValue;
    }
    return parsedDate.toLocaleDateString("vi-VN");
};

const getImportGenderDisplay = (gender?: string | null) => {
    if (gender === "1") {
        return "Nam";
    }
    if (gender === "2") {
        return "Nữ";
    }
    if (gender === "3") {
        return "Khác";
    }
    return "";
};

const ImportFormModel = ({
    open,
    onClose,
    data,
    onImport,
    isImporting = false,
}: ImportFormModelProps) => {
    const [openConfirmClose, setOpenConfirmClose] = useState(false);
    const [validStudents, setValidStudents] = useState<IStudentFileData[]>([]);
    const [invalidStudents, setInvalidStudents] = useState<IStudentFileInvalidRow[]>([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingSource, setEditingSource] = useState<RowSource>("valid");
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const [editingStudent, setEditingStudent] = useState<IStudentFileData | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        setValidStudents(data?.students ?? []);
        setInvalidStudents(data?.invalid_students ?? []);
    }, [open, data]);

    const rows: ImportPreviewRow[] = useMemo(() => {
        const validRows: ImportPreviewRow[] = validStudents.map((student, index) => ({
            ...student,
            source: "valid",
            index,
        }));
        const invalidRows: ImportPreviewRow[] = invalidStudents.map((student, index) => ({
            ...student,
            source: "invalid",
            index,
            errors: student.errors,
            row: student.row,
        }));
        return [...validRows, ...invalidRows];
    }, [validStudents, invalidStudents]);

    const handleCloseWithConfirm = () => {
        setOpenConfirmClose(true);
    };

    const hasInvalidRows = invalidStudents.length > 0;

    const handleImport = async () => {
        if (hasInvalidRows) {
            return;
        }
        await onImport(validStudents);
    };

    const openEdit = (row: ImportPreviewRow) => {
        setEditingSource(row.source);
        setEditingIndex(row.index);
        setEditingStudent({
            student_code: row.student_code ?? null,
            name: row.name ?? null,
            gender: row.gender ?? null,
            date_of_birth: row.date_of_birth ?? null,
            email: row.email ?? null,
            phone: row.phone ?? null,
            address: row.address ?? null,
            class_id: row.class_id ?? null,
            class_code: row.class_code ?? null,
            class_name: row.class_name ?? null,
        });
        setOpenEditDialog(true);
    };

    const handleSaveEdit = (student: IStudentFileData) => {
        if (editingIndex < 0) {
            setOpenEditDialog(false);
            return;
        }

        if (editingSource === "valid") {
            setValidStudents((prev) =>
                prev.map((item, index) => (index === editingIndex ? student : item))
            );
        } else {
            setInvalidStudents((prev) => prev.filter((_, index) => index !== editingIndex));
            setValidStudents((prev) => [...prev, student]);
        }

        setOpenEditDialog(false);
        setEditingStudent(null);
        setEditingIndex(-1);
    };

    return (
        <Dialog
            open={open}
            onClose={handleCloseWithConfirm}
            fullWidth
            maxWidth="xl"
        >
            <DialogTitle className="primary-dialog-title">Import Student Preview</DialogTitle>

            <DialogContent dividers>
                {!data ? (
                    <Typography>Không có dữ liệu import.</Typography>
                ) : (
                    <Box sx={{ display: "grid", gap: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                            File name: {data.file_information.file_name}
                        </Typography>
                        {hasInvalidRows && (
                            <Typography sx={{ color: "#d32f2f", fontWeight: 600 }}>
                                Còn {invalidStudents.length} dòng lỗi, vui lòng sửa trước khi import.
                            </Typography>
                        )}

                        <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 520 }}>
                            <Table stickyHeader className="sticky-table" aria-label="import preview students table">
                                <TableHead className="primary-thead">
                                    <TableRow className="primary-trow">
                                        <TableCell className="primary-thead__cell" align="center">Mã sinh viên</TableCell>
                                        <TableCell className="primary-thead__cell" align="left">Tên sinh viên</TableCell>
                                        <TableCell className="primary-thead__cell" align="center">Giới tính</TableCell>
                                        <TableCell className="primary-thead__cell" align="center">Ngày sinh</TableCell>
                                        <TableCell className="primary-thead__cell" align="left">Email</TableCell>
                                        <TableCell className="primary-thead__cell" align="left">Điện thoại</TableCell>
                                        <TableCell className="primary-thead__cell" align="center">Mã lớp</TableCell>
                                        <TableCell className="primary-thead__cell" align="left">Lý do lỗi</TableCell>
                                        <TableCell className="primary-thead__cell" align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((student, index) => (
                                        <TableRow key={`${student.student_code || "student"}-${student.source}-${index}`} className="sticky-trow">
                                            <TableCell className="sticky-tcell" align="center">{student.student_code || ""}</TableCell>
                                            <TableCell className="sticky-tcell" align="left">{student.name || ""}</TableCell>
                                            <TableCell className="sticky-tcell" align="center">{getImportGenderDisplay(student.gender)}</TableCell>
                                            <TableCell className="sticky-tcell" align="center">{formatDate(student.date_of_birth)}</TableCell>
                                            <TableCell className="sticky-tcell" align="left">{student.email || ""}</TableCell>
                                            <TableCell className="sticky-tcell" align="left">{student.phone || ""}</TableCell>
                                            <TableCell className="sticky-tcell" align="center">{student.class_code || ""}</TableCell>
                                            <TableCell
                                                className="sticky-tcell"
                                                align="left"
                                                sx={student.source === "invalid" ? { color: "#d32f2f", fontWeight: 600 } : undefined}
                                            >
                                                {student.source === "invalid" ? student.errors?.join(", ") || "" : ""}
                                            </TableCell>
                                            <TableCell className="sticky-tcell" align="center">
                                                <IconButton
                                                    className="primary-tcell__button--icon"
                                                    onClick={() => openEdit(student)}
                                                >
                                                    <EditSquareIcon />
                                                </IconButton>
                                                <IconButton
                                                    className="primary-tcell__button--icon primary-tcell__button--delete"
                                                    onClick={() => {
                                                        if (student.source === "valid") {
                                                            setValidStudents((prev) =>
                                                                prev.filter((_, i) => i !== student.index)
                                                            );
                                                        } else {
                                                            setInvalidStudents((prev) =>
                                                                prev.filter((_, i) => i !== student.index)
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseWithConfirm} className="button-cancel">Huỷ</Button>
                <Button onClick={handleImport} disabled={isImporting || hasInvalidRows}>
                    {isImporting ? "Importing..." : "Import"}
                </Button>
            </DialogActions>

            <ConfirmDialog
                open={openConfirmClose}
                title="Xác nhận thoát"
                message="Bạn có chắc muốn thoát form import?"
                onCancel={() => setOpenConfirmClose(false)}
                onConfirm={() => {
                    setOpenConfirmClose(false);
                    onClose();
                }}
            />

            <ImportFormModelDialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                initialStudent={editingStudent}
                onSave={handleSaveEdit}
            />
        </Dialog>
    );
};

export default ImportFormModel;
