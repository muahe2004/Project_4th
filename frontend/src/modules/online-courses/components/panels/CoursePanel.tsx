import { Box } from "@mui/material";
import { useState } from "react";
import { useGetCourses } from "../../apis/getCourses";
import type { ICourses } from "../../types";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import Button from "../../../../components/Button/Button";
import { CourseTable } from "../tables/CoursesTable";
import CourseFormModal from "../models/CourseFormModel";

export const CoursePanel: React.FC = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined
    };

    const { data: courses, isLoading } = useGetCourses(Params);

    const [selectedCourse, setSelectedCourse] = useState<ICourses | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");

    const handleEdit = (course: ICourses) => {
        setMode("edit");
        setSelectedCourse(course);
        setOpen(true);
    };

    const handleDelete = (course: ICourses) => {
        console.log("Xoá khoá học:", course);
    };

    return (
        <Box>
            <Box className="departments-box">
                <SearchEngine
                    placeholder="Tìm theo tên khoá học, mã"
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
                    className="departments-button__add"
                >
                    Thêm khoá học
                </Button>
            </Box>

            <CourseTable
                courses={courses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <CourseFormModal
                open={open}
                mode={mode}
                initialValues={selectedCourse}
                onClose={() => setOpen(false)}
            />
        </Box>
    );
};