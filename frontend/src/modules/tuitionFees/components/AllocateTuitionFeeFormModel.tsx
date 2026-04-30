import { useEffect, useMemo, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import axios from "axios";

import Button from "../../../components/Button/Button";
import CheckBox from "../../../components/Checkbox/CheckBox";
import Loading from "../../../components/Loading/Loading";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { STATUS } from "../../../constants/status";
import { useDepartmentsDropDown } from "../../department/apis/getDepartmentsDropDown";
import { useBulkStudentTuitionFeeByDepartment } from "../apis/bulkByTuitionFee";
import "./AllocateTuitionFeeFormModel.css";

interface AllocateTuitionFeeFormModelProps {
  open: boolean;
  onClose: () => void;
}

export default function AllocateTuitionFeeFormModel({
  open,
  onClose,
}: AllocateTuitionFeeFormModelProps) {
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const { showSnackbar } = useSnackbar();
  const { mutateAsync: bulkAllocateTuitionFee, isPending } =
    useBulkStudentTuitionFeeByDepartment();
  const departmentParams = {
    limit: 200,
    skip: 0,
    status: STATUS.ACTIVE,
    search: undefined,
  };

  const { data: departments = [], isLoading } = useDepartmentsDropDown(departmentParams);

  const departmentOptions = useMemo(() => departments ?? [], [departments]);

  useEffect(() => {
    if (!open) {
      setSelectedDepartmentIds([]);
    }
  }, [open]);

  const handleSave = () => {
    void bulkAllocateTuitionFee({ department_ids: selectedDepartmentIds })
      .then((response) => {
        showSnackbar(
          `Đã gán học phí cho ${response.created_records} bản ghi.`,
          "success"
        );
        onClose();
      })
      .catch((error) => {
        const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
        showSnackbar(detail || "Có lỗi xảy ra, vui lòng thử lại!", "error");
      });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="primary-dialog department-form"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="primary-dialog-title">ALLOCATE TUITION FEE</DialogTitle>

      <DialogContent className="primary-dialog-content">
        {isLoading ? (
          <Loading />
        ) : (
          <Box className="allocate-tuition-fee-form__list">
            {departmentOptions.map((department) => {
              const checked = selectedDepartmentIds.includes(department.id);

              return (
                <Box
                  key={department.id}
                  className={`allocate-tuition-fee-form__card${
                    checked ? " allocate-tuition-fee-form__card--checked" : ""
                  }`}
                  onClick={() => {
                    setSelectedDepartmentIds((current) =>
                      current.includes(department.id)
                        ? current.filter((id) => id !== department.id)
                        : [...current, department.id]
                    );
                  }}
                >
                  <Box className="allocate-tuition-fee-form__card-content">
                    <Typography className="allocate-tuition-fee-form__label">
                      {`${department.department_name} (${department.department_code})`}
                    </Typography>
                  </Box>

                  <CheckBox checked={checked} />
                </Box>
              );
            })}
            {!departmentOptions.length && (
              <Typography className="allocate-tuition-fee-form__empty">
                Không có department nào để chọn.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={onClose} className="button-cancel">
          Hủy
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!selectedDepartmentIds.length || isPending}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
