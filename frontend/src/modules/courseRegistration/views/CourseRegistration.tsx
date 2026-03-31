import { useState } from "react";

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
import { dashBoardUrl } from "../../../routes/urls";

import { useGetClassesForRegister } from "../apis/courseRegistration";

import "./styles/CourseRegistration.css";

export function CourseRegistration() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");

    const params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
    };

    const { data: classesForRegister } = useGetClassesForRegister(params);

    return (
        <main className="admin-main-container">
            <BreadCrumb
                className="department-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "Đăng ký học phần" },
                ]}
            />

            <Box className="admin-main-box">
                <SearchEngine
                    placeholder="Tìm theo mã lớp, tên lớp, giảng viên, chuyên ngành..."
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                />
            </Box>

            <TableContainer className="sticky-table-container" component={Paper}>
                <Table stickyHeader className="sticky-table" aria-label="course registration table">
                    <TableHead className="primary-thead">
                        <TableRow className="primary-trow">
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
                                Chủ nhiệm
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Chuyên ngành
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Loại lớp
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Trạng thái đăng ký
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="sticky-tbody">
                        {(classesForRegister?.data ?? []).map((row) => (
                            <TableRow key={row.class_info.id} className="sticky-trow">
                                <TableCell className="sticky-tcell" align="center">
                                    {row.class_info.class_code}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.class_info.class_name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    {row.class_info.size}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.teacher_info.teacher_name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="left">
                                    {row.specialization_info.specialization_name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    {row.class_info.class_type}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    {row.class_info.registration_status}
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
        </main>
    );
}

export default CourseRegistration;
