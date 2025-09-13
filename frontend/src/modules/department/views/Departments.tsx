import PaginationUniCore from "../../../components/Pagination/Pagination";
import "./styles/Department.css";
import {
    Box,
    IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import Button from "../../../components/Button/Button";
import { useEffect, useState } from "react";
import DepartmentForm from "../components/DepartmentFormModel";
import { useGetDepartment } from "../apis/getDepartments";
import dayjs from "dayjs";
import Loading from "../../../components/Loading/Loading";

type Department = {
    id: string;
    department_code: string;
    name: string;
    description: string;       
    established_date: string;  
    status: string;
};

function createData(
    id: string,
    department_code: string,
    name: string,
    description: string,
    established_date: string,
    status: string
): Department {
    return { id, department_code, name, description, established_date, status };
}

const rows: Department[] = [
    createData("1", "000000", "Công nghệ thông tin", "Quản lý đào tạo CNTT", "2005-09-01", "Active"),
    createData("2", "000001", "Kinh tế", "Quản lý đào tạo kinh tế", "2008-03-15", "Active"),
    createData("3", "000002", "May", "Quản lý đào tạo ngành May", "2009-07-20", "Active"),
    createData("4", "000003", "Cơ khí", "Quản lý đào tạo ngành Cơ khí", "2010-11-05", "Active"),
    createData("5", "000004", "Ngoại ngữ", "Quản lý đào tạo Ngoại ngữ", "2012-02-10", "Active"),
    createData("6", "000005", "Điện - Điện tử", "Quản lý đào tạo ngành Điện - Điện tử", "2013-06-18", "Active"),
    createData("7", "000006", "Quản trị kinh doanh", "Quản lý đào tạo ngành Quản trị kinh doanh", "2014-04-12", "Active"),
    createData("8", "000007", "Du lịch", "Quản lý đào tạo ngành Du lịch", "2015-09-30", "Active"),
    createData("9", "000008", "Kiến trúc", "Quản lý đào tạo ngành Kiến trúc", "2016-01-22", "Active"),
    createData("10", "000009", "Y tế", "Quản lý đào tạo ngành Y tế", "2017-12-14", "Active"),
    
];


export function Departments() {

    const searchDepartment = (value: string) => {
        console.log("value: ", value);
    }

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");

    const { data: department, isLoading: isLoadingDeparment, error: errorDepatment } = useGetDepartment();

    const isLoading = isLoadingDeparment;

    useEffect(() => {
        console.log("Department:", department);
        console.log("Loading:", isLoadingDeparment);
        }, [department, isLoadingDeparment]);

    return (
        <main className="departments">
            {
                isLoading && (<Loading></Loading>)
            }
            
            <Box className="departments-box">
                <SearchEngine 
                    placeholder="Tìm khoa..." 
                    onSearch={(val) => {
                        searchDepartment(val);
                    }} 
                />
                <Button
                    onClick={() => {
                        setMode("add");
                        setOpen(true);
                    }}
                    className="departments-button__add">
                    Add Department
                </Button>
            </Box>

            <TableContainer
                className="sticky-table-container"
                component={Paper}
            >
                <Table stickyHeader className="sticky-table" aria-label="departments table">
                    <TableHead className="primary-thead">
                        <TableRow className="primary-trow">
                            <TableCell className="primary-thead__cell" align="center">
                                Mã khoa
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Tên khoa
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Ngày thành lập
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Trạng thái
                            </TableCell>
                            <TableCell className="primary-thead__cell" align="center">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="sticky-tbody">
                        {department?.data.map((row) => (
                            <TableRow key={row.id} className="sticky-trow">
                                <TableCell  className="sticky-tcell" align="center">
                                {row.department_code}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                {row.name}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    {dayjs(row.established_date).format("DD-MM-YYYY")}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                {row.status}
                                </TableCell>
                                <TableCell className="sticky-tcell" align="center">
                                    <IconButton className="primary-tcell__button--icon" >
                                        <EditSquareIcon/>
                                    </IconButton>
                                    <IconButton className="primary-tcell__button--icon primary-tcell__button--delete">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <PaginationUniCore></PaginationUniCore>

            <DepartmentForm 
                open={open} 
                mode={mode} 
                onClose={() => setOpen(false)} 
                onSubmit={(values) => {
                console.log("Submit:", values);
                }} 
            />
        </main>
    );
}

export default Departments;