import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Box,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Button from "../../../../components/Button/Button";
import LabelPrimary from "../../../../components/Label/Label";
import { useSnackbar } from "../../../../components/SnackBar/SnackBar";
import { useGetLessons } from "../../apis/lessons/getLessons";
import type { IQuestions, IAnswers, QuestionResponse } from "../../types";
import { useGetLectures } from "../../apis/lectures/getLecture";
import { useGetCourses } from "../../apis/getCourses";
import { useCreateQuestion } from "../../apis/questions/addQuestion";
import { useEditQuestion } from "../../apis/questions/editQuestion";
import { useCreateAnswer } from "../../apis/questions/addAnswer";
import { useEditAnswer } from "../../apis/questions/editAnswer";

interface QuestionFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: QuestionResponse;
    onClose: () => void;
}

const QuestionFormModal: React.FC<QuestionFormProps> = ({ open, mode, initialValues, onClose }) => {
    const ID = initialValues?.id;
    const { showSnackbar } = useSnackbar();

    const [noiDung, setNoiDung] = useState("");
    const [dapAns, setDapAns] = useState<IAnswers[]>([]);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [searchCourse, setSearchCourse] = useState("");
    const [searchLesson, setSearchLesson] = useState("");
    const [khoaHocId, setKhoaHocId] = useState("");
    const [chuongHocId, setChuongHocId] = useState("");
    const [baiHocId, setBaiHocId] = useState("");

    const ParamsCourse = {
        page: page,
        pageSize: rowsPerPage,
        search: searchCourse || undefined,
    };

    const ParamsLesson = {
        page: page,
        pageSize: rowsPerPage,
        search: searchLesson || undefined,
        khoaHocId: khoaHocId || ""
    };

    const ParamsLecture = {
        page: page,
        pageSize: rowsPerPage,
        search: searchLesson || undefined,
        chuongHocId: chuongHocId || ""
    };

    const { data: courses, isLoading: isLoadingCourses } = useGetCourses(ParamsCourse);
    const { data: lessons, isLoading: isLoadingLessons } = useGetLessons(ParamsLesson);
    const { data: lectures, isLoading: isLoadingLectures } = useGetLectures(ParamsLecture);


    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setNoiDung(initialValues.noiDung);
            setBaiHocId(initialValues.baiHocId);
            setDapAns(initialValues.dapAns || []);
            setKhoaHocId("");
            setChuongHocId("");

            setDapAns(
                (initialValues.dapAns || []).map((ans) => ({
                    id: ans.id ?? "", 
                    cauHoiId: initialValues.id ?? "", 
                    noiDungDapAn: ans.noiDungDapAn,
                    laDapAnDung: ans.laDapAnDung,
                }))
            );

        } else {
            setNoiDung("");
            setKhoaHocId("");
            setChuongHocId("");
            setBaiHocId("");
            setDapAns([
                { cauHoiId: "", noiDungDapAn: "", laDapAnDung: false },
                { cauHoiId: "", noiDungDapAn: "", laDapAnDung: false },
                { cauHoiId: "", noiDungDapAn: "", laDapAnDung: false },
                { cauHoiId: "", noiDungDapAn: "", laDapAnDung: false },
            ]);
        }
    }, [mode, initialValues, open]);

    const { mutateAsync: createQuestion } = useCreateQuestion({});
    const { mutateAsync: editQuestion } = useEditQuestion({});
    const { mutateAsync: createAnswer } = useCreateAnswer({});
    const { mutateAsync: editAnswer } = useEditAnswer({});

    const handleChangeAnswer = (index: number, field: keyof IAnswers, value: any) => {
        setDapAns((prev) =>
            prev.map((ans, i) => {
                if (field === "laDapAnDung") {
                    return { ...ans, laDapAnDung: i === index ? value : false };
                }
                return i === index ? { ...ans, [field]: value } : ans;
            })
        );
    };

    const handleSubmitClick = async () => {
        try {
            const payloadQuestion: IQuestions = {
                noiDung,
                baiHocId,
            };

            if (mode === "add") {
                const resQues = await createQuestion(payloadQuestion);
                const cauHoiId = resQues?.data?.id;

                const payloadAnswers: IAnswers[] = dapAns.map((ans) => ({
                    ...ans,
                    cauHoiId, 
                }));

                await createAnswer(payloadAnswers);
            } else if (mode === "edit") {
                await editQuestion({ id: ID as string, data: payloadQuestion });

                await Promise.all(
                    dapAns.map((ans) => {
                        const { noiDungDapAn, laDapAnDung, cauHoiId } = ans;

                        return editAnswer({
                            id: ans.id!, 
                            data: {
                                noiDungDapAn,
                                laDapAnDung,
                                cauHoiId
                            },
                        });
                    })
                );
            }

            showSnackbar(mode === "add" ? "Thêm khoa thành công!" : "Cập nhật khoa thành công!", "success");
            onClose();
        } catch (error) {
            console.error("Lỗi khi lưu câu hỏi:", error);
            showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="primary-dialog department-form" maxWidth="md" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? "THÊM CÂU HỎI" : "SỬA CÂU HỎI"}
            </DialogTitle>

            <DialogContent className="primary-dialog-content flex-dialog-content">

                <Box className="dialog-content-box">
                    <LabelPrimary value="Khoá học" required />
                    <Select
                        value={khoaHocId}
                        onChange={(e) => setKhoaHocId(e.target.value)}
                        fullWidth
                        variant="outlined"
                        className="main-text__field primary-dialog-input"
                        MenuProps={{ disableScrollLock: true }}
                    >
                        {courses?.data?.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.tenKhoaHoc}
                            </MenuItem>
                        ))}
                    </Select>

                    <LabelPrimary value="Chương học" required />
                    <Select
                        value={chuongHocId}
                        onChange={(e) => setChuongHocId(e.target.value)}
                        fullWidth
                        variant="outlined"
                        className="main-text__field primary-dialog-input"
                        MenuProps={{ disableScrollLock: true }}
                    >
                        {lessons?.data?.map((lesson) => (
                            <MenuItem key={lesson.id} value={lesson.id}>
                                {lesson.tenChuong}
                            </MenuItem>
                        ))}
                    </Select>

                    <LabelPrimary value="Bài học" required />
                    <Select
                        value={baiHocId}
                        onChange={(e) => setBaiHocId(e.target.value)}
                        fullWidth
                        variant="outlined"
                        className="main-text__field primary-dialog-input"
                        MenuProps={{ disableScrollLock: true }}
                    >
                        {lectures?.data?.map((lecture) => (
                            <MenuItem key={lecture.id} value={lecture.id}>
                                {lecture.tenBaiHoc}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Box className="dialog-content-box">
                    <LabelPrimary value="Nội dung câu hỏi" required />
                    <TextField
                        value={noiDung}
                        onChange={(e) => setNoiDung(e.target.value)}
                        fullWidth
                        variant="outlined"
                        className="main-text__field primary-dialog-input"
                    />

                    <LabelPrimary value="Danh sách đáp án" required />

                    {dapAns.map((ans, index) => (
                        <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            className="main-text__field"
                            mb={1}
                        >
                            <TextField
                                value={ans.noiDungDapAn}
                                onChange={(e) =>
                                    handleChangeAnswer(index, "noiDungDapAn", e.target.value)
                                }
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        className="primary-checkbox"
                                        checked={ans.laDapAnDung}
                                        onChange={(e) =>
                                            handleChangeAnswer(index, "laDapAnDung", e.target.checked)
                                        }
                                    />
                                }
                                label="Đúng"
                            />
                        </Box>
                    ))}
                </Box>
                
            </DialogContent>

            <DialogActions className="primary-dialog-actions">
                <Button onClick={onClose} className="button-cancel">
                    Hủy
                </Button>
                <Button onClick={handleSubmitClick} variant="contained">
                    {mode === "add" ? "Thêm" : "Lưu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuestionFormModal;