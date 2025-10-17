import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import { STATUS } from "../../../constants/status";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import "./styles/CourseFormModel.css";
import type { ILectures } from "../types";
import { useGetCourses } from "../apis/getCourses";
import { useCreateLesson } from "../apis/lessons/addLesson";
import { useEditLesson } from "../apis/lessons/editLesson";
import { useCreateLecture } from "../apis/lectures/addLecture";
import { useEditLecture } from "../apis/lectures/editLecture";
import { useGetLessons } from "../apis/lessons/getLessons";

interface LectureFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: ILectures;
    onClose: () => void;
}

const LectureFormModal: React.FC<LectureFormProps> = ({ open, mode, initialValues, onClose }) => {
    const ID = initialValues?.id;
    const { showSnackbar } = useSnackbar();

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [search, setSearch] = useState("");

    const Params = {
        page: page,
        pageSize: rowsPerPage,
        search: search || undefined
    };

    const { data: courses, isLoading: isLoadingCourses } = useGetCourses(Params);
    const { data: lessons, isLoading } = useGetLessons(Params);

    const [tenBaiHoc, setTenBaiHoc] = useState("");
    const [khoaHocId, setKhoaHocId] = useState("");
    const [chuongHocId, setChuongHocId] = useState("");

    const [openConfirmSave, setOpenConfirmSave] = useState(false);

    const { mutateAsync: createLecture } = useCreateLecture({});
    const { mutateAsync: editLecture } = useEditLecture({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setTenBaiHoc(initialValues.tenBaiHoc || "");
            setChuongHocId(initialValues.chuongHocId || "");
        } else {
            setTenBaiHoc("");
            setChuongHocId("");
        }
    }, [mode, initialValues, open]);

    const currentValues = {
        tenBaiHoc: tenBaiHoc,
    };

    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
        mode,
        initialValues,
        currentValues,
        onClose,
    });

    const handleSubmitClick = async () => {
        try {
            const payload: ILectures = {
                tenBaiHoc: tenBaiHoc,
                chuongHocId: chuongHocId,
                trangThai: STATUS.ACTIVE,
                moTaBaiHoc: "",
                video: ""
            };

            console.log(payload);

            if (mode === "add") await createLecture(payload);
            else if (mode === "edit") await editLecture({ id: ID as string, data: payload });

            showSnackbar(mode === "add" ? "Thêm chương học thành công!" : "Cập nhật chương học thành công!", "success");
            onClose();
        } catch (error) {
            console.error("Lỗi khi thêm chương học.", error);
            showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseClick} className="primary-dialog department-form" maxWidth="xs" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? "ADD COURSE" : "UPDATE COURSE"}
            </DialogTitle>
            <DialogContent className="primary-dialog-content">
                <LabelPrimary value="Tên Chương Học" required />
                <TextField
                    value={tenBaiHoc}
                    onChange={(e) => setTenBaiHoc(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="myprofile-text__field primary-dialog-input"
                />

                <LabelPrimary value="Khoá Học"></LabelPrimary>
                {!isLoading && (
                    <Select
                        value={khoaHocId}
                        onChange={(e) => setKhoaHocId(e.target.value)}
                        fullWidth
                        id="outlined-select"
                        variant="outlined"
                        className="myprofile-text__field primary-dialog-input"
                        defaultValue=""
                        MenuProps={{ disableScrollLock: true }}
                    >
                        {courses?.data?.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.tenKhoaHoc}
                            </MenuItem>
                        ))}
                    </Select>
                )}

                <LabelPrimary value="Chương Học"></LabelPrimary>
                {!isLoading && (
                    <Select
                        value={chuongHocId}
                        onChange={(e) => setChuongHocId(e.target.value)}
                        fullWidth
                        id="outlined-select"
                        variant="outlined"
                        className="myprofile-text__field primary-dialog-input"
                        defaultValue=""
                        MenuProps={{ disableScrollLock: true }}
                    >
                        {lessons?.data?.map((lesson) => (
                            <MenuItem key={lesson.id} value={lesson.id}>
                                {lesson.tenChuong}
                            </MenuItem>
                        ))}
                    </Select>
                )}
            </DialogContent>

            <DialogActions className="primary-dialog-actions">
                <Button onClick={handleCloseClick} className="button-cancel">Hủy</Button>
                <Button onClick={handleSubmitClick} variant="contained">
                    {mode === "add" ? "Thêm" : "Lưu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LectureFormModal;

