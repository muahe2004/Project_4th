import * as React from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import type { SelectChangeEvent } from "@mui/material/Select";

import "./Pagination.css";

export default function PaginationUniCore() {
    const [page, setPage] = React.useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

    const totalItems = 95;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(1); 
    };

    return (
        <div className="pagination-unicore">
            <Stack direction="row" spacing={2} alignItems="center">
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
                    variant="outlined"
                />

                <span id="rows-per-page-label">Items / trang</span>

                <FormControl className="pagination-unicore__select">
                    <Select<number>
                        labelId="rows-per-page-label"
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </div>
    );
}
