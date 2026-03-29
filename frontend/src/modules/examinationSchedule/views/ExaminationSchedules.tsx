import { useState } from "react";
import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import { Box } from "@mui/material";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { STATUS_OPTIONS } from "../../../constants/status";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import { useGetExaminationSchedules } from "../apis/getExaminationSchedule";
import ExaminationScheduleTable from "../components/ExaminationScheduleTable";


export function ExaminationSchedules() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(status && { status }),
    };

    const { data: examinationSchedules, isLoading } = useGetExaminationSchedules(params);

    if (isLoading) {
        return (
            <main className="admin-main-container">
                <Loading />
            </main>
        );
    }

    return(
        <main className="admin-main-container">
            <BreadCrumb
                className="students-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "ExaminationSchedules" },
                ]}
            />

            <Box className="admin-main-box">
                <StatusFilter
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                />
                
                <SearchEngine 
                    placeholder="Tìm theo lớp, môn, phòng..."
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                />
                <Button
                    onClick={() => {
                        // setMode("add");
                        // setSelectedStudent(undefined);
                        // setOpen(true);
                    }}
                    className="btn-spacing-left">
                    Add Examination Schedule
                </Button>
            </Box>

            <ExaminationScheduleTable examinationSchedules={examinationSchedules} />

            <PaginationUniCore
                totalItems={examinationSchedules?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(p) => setPage(p)}
                onRowsPerPageChange={(r) => {
                    setRowsPerPage(r);
                    setPage(1);
                }}
            ></PaginationUniCore>
        </main>
    )
}
