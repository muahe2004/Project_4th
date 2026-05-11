
import { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import PaginationUniCore from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import StatusFilter from "../../../components/StatusFilter/StatusFilter";
import { STATUS_OPTIONS } from "../../../constants/status";
import { dashBoardUrl, layOutAdminUrl, studentTuitionFeeUrl } from "../../../routes/urls";
import { useGetTuitionFees } from "../apis/getTuitionFees";
import AllocateTuitionFeeFormModel from "../components/AllocateTuitionFeeFormModel";
import TuitionFeeFormModel from "../components/TuitionFeeFormModel";
import TuitionFeeTable from "../components/TuitionFeeTable";
import type { ITuitionFee } from "../types";
import "./styles/TuitionFees.css";

export function TuitionFees() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openAllocateForm, setOpenAllocateForm] = useState(false);
  const [selectedTuitionFee, setSelectedTuitionFee] = useState<ITuitionFee | undefined>(
    undefined
  );

  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
  };

  const { data: tuitionFees, isLoading } = useGetTuitionFees(params);

  if (isLoading) {
    return (
      <main className="admin-main-container">
        <Loading />
      </main>
    );
  }

  return (
    <main className="admin-main-container">
      <BreadCrumb
        className="tuition-fees-breadcrumb"
        items={[
          { label: t("common.dashboard"), to: dashBoardUrl },
          { label: t("tuitionFees.title") },
        ]}
      />

      <Box className="admin-main-box">
        <StatusFilter
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />

        <SearchEngine
          placeholder={t("tuitionFees.searchPlaceholder")}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Button
          onClick={() => {
            setSelectedTuitionFee(undefined);
            setOpenForm(true);
          }}
          className="btn-spacing-left"
        >
          {t("tuitionFees.addTuitionFee")}
        </Button>

        <Button
          onClick={() => {
            setOpenAllocateForm(true);
          }}
          className="btn-spacing-left"
        >
          {t("tuitionFees.allocateTuitionFee")}
        </Button>

        <Button
          onClick={() => {
            navigate(`${layOutAdminUrl}/${studentTuitionFeeUrl}`);
          }}
          className="btn-spacing-left"
        >
          {t("tuitionFees.studentView")}
        </Button>
      </Box>

      <TuitionFeeTable
        tuitionFees={tuitionFees}
        onEdit={(tuitionFee) => {
          setSelectedTuitionFee(tuitionFee);
          setOpenForm(true);
        }}
        onDelete={(tuitionFee) => {
          console.log("delete tuition fee", tuitionFee);
        }}
      />

      <PaginationUniCore
        totalItems={tuitionFees?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(currentPage) => setPage(currentPage)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(1);
        }}
      />

      <TuitionFeeFormModel
        open={openForm}
        mode={selectedTuitionFee ? "edit" : "add"}
        initialValues={selectedTuitionFee}
        onClose={() => {
          setOpenForm(false);
          setSelectedTuitionFee(undefined);
        }}
      />

      <AllocateTuitionFeeFormModel
        open={openAllocateForm}
        onClose={() => setOpenAllocateForm(false)}
      />
    </main>
  );
}
