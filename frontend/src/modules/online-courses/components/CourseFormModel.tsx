import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import { STATUS } from "../../../constants/status";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import "./styles/CourseFormModel.css";
import { URL_API_UPLOAD } from "../../../constants/config";
import type { ICourses } from "../types";
import { useCreateCourse } from "../apis/addCourse";
import { useEditCourse } from "../apis/editCourse";

interface CourseFormProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: ICourses;
    onClose: () => void;
}

const CourseFormModal: React.FC<CourseFormProps> = ({ open, mode, initialValues, onClose }) => {
    const ID = initialValues?.id;
    const { showSnackbar } = useSnackbar();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);


    const [maKhoaHoc, setMaKhoaHoc] = useState("");
    const [tenKhoaHoc, setTenKhoaHoc] = useState("");
    const [moTa, setMoTa] = useState("");
    const [doKho, setDoKho] = useState("");
    const [giaBan, setGiaBan] = useState("");

    const [openConfirmSave, setOpenConfirmSave] = useState(false);

    const { mutateAsync: createCourse } = useCreateCourse({});
    const { mutateAsync: editCourse } = useEditCourse({});

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            setMaKhoaHoc(initialValues.maKhoaHoc || "");
            setTenKhoaHoc(initialValues.tenKhoaHoc || "");
            setMoTa(initialValues.moTa || "");
            setGiaBan(initialValues.giaBan || "");
            setDoKho(initialValues.doKho || "");
            setImageUrl(initialValues.hinhAnh || "");
        } else {
            setMaKhoaHoc("");
            setTenKhoaHoc("");
            setMoTa("");
            setGiaBan("");
            setDoKho("");
            setImageUrl("");
        }
    }, [mode, initialValues, open]);

    const currentValues = {
        maKhoaHoc: maKhoaHoc,
        tenKhoaHoc: tenKhoaHoc,
        moTa,
    };

    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
        mode,
        initialValues,
        currentValues,
        onClose,
    });

    const handleSubmitClick = async () => {
        try {
            const payload: ICourses = {
                maKhoaHoc: maKhoaHoc,
                tenKhoaHoc: tenKhoaHoc,
                hinhAnh: imageUrl || "",
                doKho: doKho,
                giaBan: giaBan,
                trangThai: STATUS.ACTIVE,
                moTa,
            };

            if (mode === "add") await createCourse(payload);
            else if (mode === "edit") await editCourse({ id: ID as string, data: payload });

            showSnackbar(mode === "add" ? "Thêm khoa thành công!" : "Cập nhật khoa thành công!", "success");
            onClose();
        } catch (error) {
            console.error("Lỗi khi thêm khoá học.", error);
            showSnackbar("Có lỗi xảy ra, vui lòng thử lại!", "error");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${URL_API_UPLOAD}`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setImageUrl(data.imageUrl);
            showSnackbar("Tải ảnh lên thành công!", "success");
        } catch (err) {
            console.error(err);
            showSnackbar("Lỗi khi tải ảnh lên!", "error");
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseClick} className="primary-dialog department-form" maxWidth="md" fullWidth>
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? "ADD COURSE" : "UPDATE COURSE"}
            </DialogTitle>
            <DialogContent className="primary-dialog-content flex-dialog-content">
                <Box className="dialog-content-box">
                    <LabelPrimary value="Hình ảnh khóa học" />

                    <Box display="flex" flexDirection="column" gap={2}>
                        {previewUrl || imageUrl ? (
                            <Box
                                component="img"
                                src={previewUrl || imageUrl!}
                                alt="Course Image"
                                sx={{
                                    width: "100%",
                                    height: 175,
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    border: "1px solid #ccc",
                                }}
                            />
                            ) : (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 175,
                                        borderRadius: 2,
                                        border: "2px dashed #ccc",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#999",
                                        fontSize: 14,
                                    }}
                                >
                                    Chưa chọn ảnh
                                </Box>
                            )}

                        <Button
                            component="label"
                            className="myprofile-text__field primary-dialog-input"
                        >
                            Chọn ảnh
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={handleFileChange}
                            />
                        </Button>
                    </Box>
                </Box>

                <Box className="dialog-content-box">
                    <LabelPrimary value="Mã Khoá Học" required />
                        <TextField
                            value={maKhoaHoc}
                            onChange={(e) => setMaKhoaHoc(e.target.value)}
                            fullWidth
                            variant="outlined"
                            className="myprofile-text__field primary-dialog-input"
                        />

                        <LabelPrimary value="Tên Khoá Học" required />
                        <TextField
                            value={tenKhoaHoc}
                            onChange={(e) => setTenKhoaHoc(e.target.value)}
                            fullWidth
                            variant="outlined"
                            className="myprofile-text__field primary-dialog-input"
                        />

                        <LabelPrimary value="Giá Bán" required />
                        <TextField
                            value={giaBan}
                            onChange={(e) => setGiaBan(e.target.value)}
                            fullWidth
                            variant="outlined"
                            className="myprofile-text__field primary-dialog-input"
                        />

                        <LabelPrimary value="Độ Khó"></LabelPrimary>
                        <Select
                            value={doKho}
                            onChange={(e) => setDoKho(e.target.value)}
                            fullWidth
                            id="outlined-select"
                            variant="outlined"
                            className="myprofile-text__field primary-dialog-input"
                            defaultValue=""
                            MenuProps={{
                                disableScrollLock: true,   
                            }}
                        >
                            <MenuItem value="1">Dễ </MenuItem>
                            <MenuItem value="2">Trung Bình</MenuItem>
                            <MenuItem value="3">Khó</MenuItem>
                        </Select>

                        <LabelPrimary value="Mô tả" />
                        <TextField
                            value={moTa}
                            onChange={(e) => setMoTa(e.target.value)}
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                            className="myprofile-text__field"
                        />
                </Box>
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

export default CourseFormModal;