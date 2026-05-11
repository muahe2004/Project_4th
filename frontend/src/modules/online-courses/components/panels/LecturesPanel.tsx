import { Box, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import Button from "../../../../components/Button/Button";
import type { ILectures } from "../../types";
import { LecturesTable } from "../tables/LecturesTable";
import LectureFormModal from "../models/LectureFormModel";
import { useGetLectures } from "../../apis/lectures/getLecture";
import { useGetCourses } from "../../apis/getCourses";
import { useGetLessons } from "../../apis/lessons/getLessons";

export const LecturesPanel: React.FC = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [khoaHocId, setKhoaHocId] = useState("");
    const [chuongHocId, setChuongHocId] = useState("");


    const ParamsCourse = {
        page: 1,
        pageSize: 100,
        search: search || undefined
    };

    const ParamsLesson = {
        page: 1,
        pageSize: 100,
        search: search || undefined,
        khoaHocId: khoaHocId || ""
    };
        
    const { data: courses, isLoading: isLoadingCourses } = useGetCourses(ParamsCourse);
    const { data: lessons, isLoading: isLoadingLessons } = useGetLessons(ParamsLesson);

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined,
        chuongHocId: chuongHocId || ""
    };

    const { data: lectures, isLoading } = useGetLectures(Params);

    const [selectedLecture, setSelectedLecture] = useState<ILectures | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");

    const handleEdit = (lecture: ILectures) => {
        setMode("edit");
        setSelectedLecture(lecture);
        setOpen(true);
    };

    const handleDelete = (lecture: ILectures) => {
        console.log("Xoá bài học:", lecture);
    };

    return (
        <Box>
            <Box className="departments-box">
                <Select
                    value={khoaHocId}
                    onChange={(e) => setKhoaHocId(e.target.value)}
                    // fullWidth
                    id="outlined-select"
                    variant="outlined"
                    className="main-text__field filter-text__field"
                    defaultValue=""
                    MenuProps={{ disableScrollLock: true }}
                >
                    {courses?.data?.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                            {course.tenKhoaHoc}
                        </MenuItem>
                    ))}
                </Select>

                <Select
                    value={chuongHocId}
                    onChange={(e) => setChuongHocId(e.target.value)}
                    // fullWidth
                    id="outlined-select"
                    variant="outlined"
                    className="main-text__field filter-text__field"
                    defaultValue=""
                    MenuProps={{ disableScrollLock: true }}
                >
                    {lessons?.data?.map((lesson) => (
                        <MenuItem key={lesson.id} value={lesson.id}>
                            {lesson.tenChuong}
                        </MenuItem>
                    ))}
                </Select>
                
                <SearchEngine
                    placeholder="Tìm theo tên bài học"
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
                    Thêm bài học
                </Button>
            </Box>

            <LecturesTable
                lectures={lectures}
                onEdit={handleEdit}
                onDelete={handleDelete}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <LectureFormModal
                open={open}
                mode={mode}
                initialValues={selectedLecture}
                onClose={() => setOpen(false)}
            />
        </Box>
    );
};
