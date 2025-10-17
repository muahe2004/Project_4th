import { Box } from "@mui/material";
import { useState } from "react";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import Button from "../../../../components/Button/Button";
import { LessonsTable } from "../tables/LessonsTable";
import { useGetLessons } from "../../apis/lessons/getLessons";
import type { ILectures, ILessons } from "../../types";
import LessonFormModal from "../LessonFormModel";
import { LecturesTable } from "../tables/LecturesTable";
import LectureFormModal from "../LectureFormModel";
import { useGetLectures } from "../../apis/lectures/getLecture";

export const LecturesPanel: React.FC = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined
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
                    Add Lecture
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