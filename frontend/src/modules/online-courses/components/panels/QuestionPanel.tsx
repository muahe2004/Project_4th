import { Box } from "@mui/material";
import { useState } from "react";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import Button from "../../../../components/Button/Button";
import type { QuestionResponse } from "../../types";
import QuestionFormModal from "../QuestionFormModel";
import { QuestionTable } from "../tables/QuestionTable";
import { useGetQuestion } from "../../apis/questions/getQuestion";

export const QuestionPanel: React.FC = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined
    };

    const { data: questions, isLoading } = useGetQuestion(Params);

    const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");

    const handleEdit = (question: QuestionResponse) => {
        setMode("edit");
        setSelectedQuestion(question);
        setOpen(true);
    };

    const handleDelete = (question: QuestionResponse) => {
        console.log("Xoá bài học:", question);
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
                    Thêm câu hỏi mới
                </Button>
            </Box>

            <QuestionTable
                questions={questions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <QuestionFormModal
                open={open}
                mode={mode}
                initialValues={selectedQuestion}
                onClose={() => setOpen(false)}
            />
        </Box>
    );
};