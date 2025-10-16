import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import { STATUS } from "../../../constants/status";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import "./styles/CourseFormModel.css";
import { URL_API_UPLOAD } from "../../../constants/config";
import type { ILessons } from "../types";
import { useCreateCourse } from "../apis/addCourse";
import { useEditCourse } from "../apis/editCourse";
import { useGetCourses } from "../apis/getCourses";
import { useCreateLesson } from "../apis/lessons/addLesson";
import { useEditLesson } from "../apis/lessons/editLesson";

interface LessonFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: ILessons;
    onClose: () => void;
}

const LessonFormModal: React.FC<LessonFormProps> = ({ open, mode, initialValues, onClose }) => {
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

    const { data: courses, isLoading } = useGetCourses(Params);

    useEffect(() => {
        console.log(courses);
    }, [ID])

    const [tenChuong, setTenChuong] = useState("");
    const [khoaHocId, setKhoaHocId] = useState("");

    const [openConfirmSave, setOpenConfirmSave] = useState(false);

    const { mutateAsync: createLesson } = useCreateLesson({});
    const { mutateAsync: editLesson } = useEditLesson({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setTenChuong(initialValues.tenChuong || "");
            setKhoaHocId(initialValues.khoaHocId || "");
        } else {
            setTenChuong("");
            setKhoaHocId("");
        }
    }, [mode, initialValues, open]);

    const currentValues = {
        tenChuong: tenChuong,
    };

    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
        mode,
        initialValues,
        currentValues,
        onClose,
    });

    const handleSubmitClick = async () => {
        try {
            const payload: ILessons = {
                tenChuong: tenChuong,
                khoaHocId: khoaHocId,
                trangThai: STATUS.ACTIVE,
            };

            console.log(payload);

            if (mode === "add") await createLesson(payload);
            else if (mode === "edit") await editLesson({ id: ID as string, data: payload });

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
                    value={tenChuong}
                    onChange={(e) => setTenChuong(e.target.value)}
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

export default LessonFormModal;