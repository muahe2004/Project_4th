import { Box, IconButton, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import Button from "../../../components/Button/Button";
import dayjs from "dayjs";
import { getStatusDisplay } from "../../../utils/status/status-display";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import type { IDepartments } from "../../department/types";
import { useGetDepartment } from "../../department/apis/getDepartments";
import { getStatusColor } from "../../../utils/status/status-color";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from "@mui/icons-material/Delete";
import { useGetCourses } from "../apis/getCourses";
import CourseFormModal from "../components/CourseFormModel";
import type { ICourses } from "../types";


interface TabPanelProps {
    children?: ReactNode;
    value: number;
    index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box sx={{ mt: 3, mr: 1, ml: 1 }}>
                {children}
                </Box>
            )}
        </div>
    );
}

export function Courses() {
    const [value, setValue] = useState<number>(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const searchDepartment = (value: string) => {
        console.log("value: ", value);
    }

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedDepartment, setSelectedCourse] = useState<ICourses | undefined>(undefined); 

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined
    };

    const { data: courses, isLoading: isLoadingCourses, error: errorCourses} = useGetCourses(Params);

    const isLoading = isLoadingCourses;

    return (
        <Box>
            <Tabs className="myprofile-tabs" value={value} onChange={handleChange}>
                <Tab classes={{ selected: "active-tab" }} label="Khoá học" />
                <Tab classes={{ selected: "active-tab" }} label="Chương học" />
                <Tab classes={{ selected: "active-tab" }} label="Bài học" />
                <Tab classes={{ selected: "active-tab" }} label="Câu hỏi" />
                <Tab classes={{ selected: "active-tab" }} label="Hoá đơn" />
            </Tabs>

            <TabPanel value={0} index={0}>
                <Box className="departments-box">
                    <SearchEngine 
                        placeholder="Tìm theo tên khoá học, mã " 
                        onSearch={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                    />
                    <Button
                        onClick={() => {
                            setMode("add");
                            setOpen(true);
                        }}
                        className="departments-button__add">
                        Add Course
                    </Button>
                </Box>

                <TableContainer
                    className="sticky-table-container"
                    component={Paper}
                >
                    <Table stickyHeader className="sticky-table" aria-label="departments table">
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
                            {courses?.data.map((row) => (
                                <TableRow key={row.id} className="sticky-trow">
                                    <TableCell  className="sticky-tcell" align="center">
                                        {row.maKhoaHoc}
                                    </TableCell>
                                    <TableCell className="sticky-tcell" align="left">
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <img
                                            src={row.hinhAnh}
                                            alt={row.tenKhoaHoc}
                                            style={{ width: 70, height: 40, objectFit: "cover", borderRadius: 4 }}
                                            />
                                            <span>{row.tenKhoaHoc}</span>
                                        </div>
                                        </TableCell>

                                    <TableCell className="sticky-tcell" align="center">
                                        {row.doKho}
                                    </TableCell>
                                    <TableCell className="sticky-tcell" align="center" sx={{ color: getStatusColor(row.trangThai)}}>
                                        {getStatusDisplay(row.trangThai)}
                                    </TableCell>
                                    <TableCell className="sticky-tcell" align="center">
                                        <IconButton 
                                            className="primary-tcell__button--icon" 
                                            onClick={() => {
                                                setMode("edit");
                                                setSelectedCourse(row);
                                                setOpen(true);
                                            }}
                                        >
                                            <EditSquareIcon/>
                                        </IconButton>
                                        <IconButton className="primary-tcell__button--icon primary-tcell__button--delete">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <PaginationUniCore
                    totalItems={courses?.pagination.totalItems || 0}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(p) => setPage(p)}
                    onRowsPerPageChange={(r) => {
                        setRowsPerPage(r);
                        setPage(1); 
                    }}
                ></PaginationUniCore>
            </TabPanel>

            <CourseFormModal 
                open={open} 
                mode={mode} 
                initialValues={selectedDepartment}
                onClose={() => setOpen(false)}
            />
        </Box>
    );
}

export default Courses;