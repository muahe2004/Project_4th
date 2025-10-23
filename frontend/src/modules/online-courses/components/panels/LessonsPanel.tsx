import { Box, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import Button from "../../../../components/Button/Button";
import { LessonsTable } from "../tables/LessonsTable";
import { useGetLessons } from "../../apis/lessons/getLessons";
import type { ILessons } from "../../types";
import LessonFormModal from "../LessonFormModel";
import { useGetCourses } from "../../apis/getCourses";

export const LessonsPanel: React.FC = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");

    const [khoaHocId, setKhoaHocId] = useState("");

    const ParamsCourse = {
        page: 1,
        pageSize: 100,
        search: search || undefined
    };

    
    
    const { data: courses, isLoading: isLoadingCourses } = useGetCourses(ParamsCourse);

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined,
        khoaHocId: khoaHocId || ""
    };

    const { data: lessons, isLoading } = useGetLessons(Params);

    const [selectedLesson, setSelectedLesson] = useState<ILessons | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");

    const handleEdit = (lesson: ILessons) => {
        setMode("edit");
        setSelectedLesson(lesson);
        setOpen(true);
    };

    const handleDelete = (lesson: ILessons) => {
        console.log("Xoá chương học:", lesson);
    };

    return (
        <Box>
            <Box className="departments-box">
                <Select
                    value={khoaHocId}
                    onChange={(e) => setKhoaHocId(e.target.value)}
                    id="outlined-select"
                    variant="outlined"
                    className="myprofile-text__field filter-text__field"
                    defaultValue=""
                    MenuProps={{ disableScrollLock: true }}
                >
                    {courses?.data?.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                            {course.tenKhoaHoc}
                        </MenuItem>
                    ))}
                </Select>

                <SearchEngine
                    placeholder="Tìm theo tên chương học"
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
                    Thêm chương học
                </Button>
            </Box>

            <LessonsTable
                lessons={lessons}
                onEdit={handleEdit}
                onDelete={handleDelete}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <LessonFormModal
                open={open}
                mode={mode}
                initialValues={selectedLesson}
                onClose={() => setOpen(false)}
            />
        </Box>
    );
};