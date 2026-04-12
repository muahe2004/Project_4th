import { useState } from "react";
import dayjs from "dayjs";

import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";

import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import Button from "../../../components/Button/Button";
import CheckBox from "../../../components/Checkbox/CheckBox";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { dashBoardUrl } from "../../../routes/urls";
import { useAuthStore } from "../../../stores/useAuthStore";

import { useGetClassesForRegister } from "../apis/courseRegistration";
import { useRegisterCourse } from "../apis/registerCourse";
import MiniCalender from "../components/MiniCalender";

import "./styles/CourseRegistration.css";

export function CourseRegistration() {
    const { showSnackbar } = useSnackbar();
    const user = useAuthStore((state) => state.user);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

    const params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(user?.id && { student_id: user.id }),
        ...(search && { search }),
    };

    const { data: classesForRegister } = useGetClassesForRegister(params);
    const { mutateAsync: registerCourse, isPending: isRegisteringCourse } = useRegisterCourse();
    const rows = classesForRegister?.data ?? [];
    const selectableRows = rows.filter((row) => !row.is_registered);
    const selectedSchedules = rows
        .filter((row) => selectedClassIds.includes(row.class_info.id))
        .flatMap((row) => row.schedule_info);
    const allChecked =
        selectableRows.length > 0 &&
        selectableRows.every((row) => selectedClassIds.includes(row.class_info.id));
    const hasPartialSelection =
        selectableRows.some((row) => selectedClassIds.includes(row.class_info.id)) && !allChecked;

    const handleToggleAll = (checked: boolean) => {
        setSelectedClassIds(checked ? selectableRows.map((row) => row.class_info.id) : []);
    };

    const handleToggleOne = (classId: string, checked: boolean) => {
        setSelectedClassIds((prev) =>
            checked ? [...new Set([...prev, classId])] : prev.filter((id) => id !== classId)
        );
    };

    const handleRegisterCourses = () => {
        const selectedRows = rows.filter((row) => selectedClassIds.includes(row.class_info.id));
        if (selectedRows.length === 0) {
            showSnackbar("Chưa chọn lớp học phần", "error");
            return;
        }

        if (!user?.id) {
            showSnackbar("Không xác định được sinh viên đăng ký", "error");
            return;
        }

        registerCourse({
            student_id: user.id,
            created_at: dayjs().toISOString(),
            updated_at: dayjs().toISOString(),
            course_sections: selectedRows.map((row) => ({
                class_id: row.class_info.id,
                status: row.class_info.status,
                class_type: row.class_info.class_type ?? "course_section",
            })),
        })
            .then(() => {
                showSnackbar("Đăng ký học phần thành công", "success");
            })
            .catch((error: any) => {
                const detail = error?.response?.data?.detail ?? error?.data?.detail ?? "Đăng ký học phần thất bại";
                showSnackbar(detail, "error");
            });
    };

    return (
        <main className="admin-main-container">
            <Box className="admin-main-box course-registration__toolbar">
                <SearchEngine
                    placeholder="Tìm theo mã lớp, tên lớp, môn học, giảng viên, chuyên ngành..."
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                />
                <Button
                    className="btn-spacing-left"
                    onClick={handleRegisterCourses}
                    disabled={isRegisteringCourse}
                >
                    Đăng ký học phần
                </Button>
            </Box>

            <Box className="course-registration__content">
                <Box className="course-registration__table-section">
                    <TableContainer
                        className="sticky-table-container course-registration__table-container"
                        component={Paper}
                    >
                        <Table
                            stickyHeader
                            className="sticky-table course-registration__table"
                            aria-label="course registration table"
                        >
                            <TableHead className="primary-thead">
                                <TableRow className="primary-trow">
                                    <TableCell
                                        className="primary-thead__cell course-registration__checkbox-cell"
                                        align="center"
                                        padding="checkbox"
                                    >
                                        <CheckBox
                                            checked={allChecked}
                                            indeterminate={hasPartialSelection}
                                            disabled={selectableRows.length === 0}
                                            onChange={(_, checked) => handleToggleAll(checked)}
                                        />
                                    </TableCell>
                                    <TableCell className="primary-thead__cell" align="center">
                                        Mã lớp
                                    </TableCell>
                                    <TableCell className="primary-thead__cell department-name-tcell" align="center">
                                        Tên lớp
                                    </TableCell>
                                    <TableCell className="primary-thead__cell" align="center">
                                        Sĩ số
                                    </TableCell>
                                    <TableCell className="primary-thead__cell" align="center">
                                        Mã môn
                                    </TableCell>
                                    <TableCell className="primary-thead__cell" align="center">
                                        Môn học
                                    </TableCell>
                                    <TableCell className="primary-thead__cell" align="center">
                                        Số tín chỉ
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="sticky-tbody">
                                {rows.map((row) => (
                                    <TableRow key={row.class_info.id} className="sticky-trow">
                                        <TableCell
                                            className="sticky-tcell course-registration__checkbox-cell"
                                            align="center"
                                            padding="checkbox"
                                        >
                                            <CheckBox
                                                disabled={row.is_registered}
                                                checked={selectedClassIds.includes(row.class_info.id)}
                                                onChange={(_, checked) =>
                                                    handleToggleOne(row.class_info.id, checked)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="sticky-tcell" align="center">
                                            {row.class_info.class_code}
                                        </TableCell>
                                        <TableCell className="sticky-tcell" align="left">
                                            {row.class_info.class_name}
                                        </TableCell>
                                        <TableCell className="sticky-tcell" align="center">
                                            {row.class_info.size}
                                        </TableCell>
                                        <TableCell className="sticky-tcell" align="center">
                                            {row.subject_info.subject_code}
                                        </TableCell>
                                        <TableCell className="sticky-tcell" align="center">
                                            {row.subject_info.subject_name}
                                        </TableCell>
                                        <TableCell className="sticky-tcell" align="center">
                                            {row.subject_info.subject_credit}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <PaginationUniCore
                        totalItems={classesForRegister?.total || 0}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(nextPage) => setPage(nextPage)}
                        onRowsPerPageChange={(nextRows) => {
                            setRowsPerPage(nextRows);
                            setPage(1);
                        }}
                    />
                </Box>

                <Box className="course-registration__calendar-section">
                    <MiniCalender schedules={selectedSchedules} />
                </Box>
            </Box>
        </main>
    );
}

export default CourseRegistration;
