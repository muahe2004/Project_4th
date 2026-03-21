import { useState } from "react";
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
import { useDeleteStudent } from "../apis/deleteStudent";
import type { IStudentsResponse } from "../types";

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

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
    };

    const { data: students } = useGetStudents(Params);
    const { mutateAsync: deleteStudents } = useDeleteStudent({});

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
        </main>
    )
}