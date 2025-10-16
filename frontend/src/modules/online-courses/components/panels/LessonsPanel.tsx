import { Box } from "@mui/material";
import { useState } from "react";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import Button from "../../../../components/Button/Button";
import { LessonsTable } from "../tables/LessonsTable";
import { useGetLessons } from "../../apis/lessons/getLessons";
import type { ILessons } from "../../types";
import LessonFormModal from "../LessonFormModel";

export const LessonsPanel: React.FC = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined
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
                    Add Lesson
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