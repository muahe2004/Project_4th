import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { useGetStudents } from "../apis/getStudents";
import { StudentTable } from "../components/StudentTable";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import { Box } from "@mui/material";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { STATUS_OPTIONS } from "../../../constants/status";
import Button from "../../../components/Button/Button";
import StudentFormModel from "../components/StudentFormModel";
import ImportFormModel from "../components/ImportFormModel";
import { useDeleteStudent } from "../apis/deleteStudent";
import { useExportExampleFile } from "../apis/exportExampleFile";
import { useImportStudents } from "../apis/importStudents";
import { useUploadStudent } from "../apis/uploadStudent";
import type { IStudentUploadResponse, IStudentsResponse } from "../types";

export function Students() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const handleEditStudent = (student: IStudentsResponse) => {
        setMode("edit");
        setSelectedStudent(student);
        setOpen(true);
    };

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedStudent, setSelectedStudent] = useState<IStudentsResponse | undefined>(undefined);
    // const [selectedDepartment, setSelectedDepartment] = useState<IDepartments | undefined>(undefined); 

    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [importPreview, setImportPreview] = useState<IStudentUploadResponse | null>(null);
    const [openImportFormModel, setOpenImportFormModel] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
    };

    const { data: students } = useGetStudents(Params);
    const { mutateAsync: deleteStudents } = useDeleteStudent({});
    const { mutateAsync: exportExampleFile, isPending: isExportingExampleFile } = useExportExampleFile({});
    const { mutateAsync: importStudents, isPending: isImportingStudents } = useImportStudents({});
    const { mutateAsync: uploadStudentFile, isPending: isUploadingStudentFile } = useUploadStudent({});

    const handleOpenImportFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleImportStudentFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        try {
            const uploadedResult = await uploadStudentFile(selectedFile);
            setImportPreview(uploadedResult);
            setOpenImportFormModel(true);
        } catch (error) {
            console.error("Upload student file failed:", error);
            setImportPreview(null);
            setOpenImportFormModel(false);
        } finally {
            event.target.value = "";
        }
    };

    return(
        <main className="admin-main-container">
            <BreadCrumb
                className="students-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "Students" },
                ]}
            />

            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                />
                
                <SearchEngine 
                    placeholder="Tìm theo tên khoa, mã " 
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                />
                <Button
                    onClick={() => {
                        setMode("add");
                        setSelectedStudent(undefined);
                        setOpen(true);
                    }}
                    className="btn-spacing-left">
                    Add Student
                </Button>

                <Button
                    onClick={() => {
                        void exportExampleFile();
                    }}
                    disabled={isExportingExampleFile}
                    className="btn-spacing-left">
                    {isExportingExampleFile ? "Đang xuất file..." : "Xuất file mẫu"}
                </Button>

                <Button
                    onClick={handleOpenImportFilePicker}
                    disabled={isUploadingStudentFile}
                    className="btn-spacing-left">
                    {isUploadingStudentFile ? "Importing..." : "Import Student"}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    style={{ display: "none" }}
                    onChange={handleImportStudentFile}
                />
            </Box>

            <StudentTable
                students={students}
                onEdit={handleEditStudent}
                onDelete={(student) => {
                    if (!student.id) {
                        return;
                    }

                    deleteStudents([student.id]);
                }}
            />
            <PaginationUniCore
                totalItems={students?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(p) => setPage(p)}
                onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setPage(1); 
            }}
            ></PaginationUniCore>

            <StudentFormModel 
                open={open} 
                mode={mode} 
                initialValues={selectedStudent}
                onClose={() => {
                    setOpen(false);
                    setSelectedStudent(undefined);
                }}
            />

            <ImportFormModel
                open={openImportFormModel}
                onClose={() => setOpenImportFormModel(false)}
                data={importPreview}
                isImporting={isImportingStudents}
                onImport={async (studentsPayload) => {
                    await importStudents(studentsPayload);
                    setOpenImportFormModel(false);
                    setImportPreview(null);
                }}
            />
        </main>
    )
}
