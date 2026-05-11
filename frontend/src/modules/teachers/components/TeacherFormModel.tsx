import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import React, { type ReactNode, useEffect, useState } from "react";
import dayjs from "dayjs";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import LabelPrimary from "../../../components/Label/Label";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { RELATIONSHIP } from "../../../constants/relationships";
import { STATUS } from "../../../constants/status";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { useGetDepartment } from "../../department/apis/getDepartments";
import { useTranslation } from "react-i18next";
import { useCreateTeacher } from "../apis/addTeacher";
import { useUpdateTeacher } from "../apis/updateTeacher";
import type {
  ITeacherCreate,
  ITeacherInformation,
  ITeacherInformationCreate,
  ITeacherRelative,
  ITeacherRelativeCreate,
  ITeacherResponse,
  ITeacherUpdate,
} from "../types";

interface TabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ mt: 3 }}>{children}</Box>}
    </div>
  );
}

interface TeacherFormModelProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: ITeacherResponse;
  onClose: () => void;
}

const DEFAULT_RELATIVE: ITeacherRelative = {
  id: undefined,
  name: "",
  date_of_birth: null,
  nationality: null,
  ethnicity: null,
  religion: null,
  occupation: null,
  phone: null,
  address: "",
  relationship: null,
  student_id: null,
  teacher_id: null,
  created_at: undefined,
  updated_at: undefined,
};

const RELATIVE_RELATIONSHIPS = [
  RELATIONSHIP.FATHER,
  RELATIONSHIP.MOTHER,
  RELATIONSHIP.MARITAL,
];

const buildRelatives = (rels?: ITeacherRelative[] | null) => {
  const map = new Map<ITeacherRelative["relationship"], ITeacherRelative>();
  rels?.forEach((relative) => {
    if (relative.relationship) {
      map.set(relative.relationship, relative);
    }
  });

  return RELATIVE_RELATIONSHIPS.map((relationship) => ({
    ...DEFAULT_RELATIVE,
    ...map.get(relationship),
    relationship,
  }));
};

const isRelativeEmpty = (relative: ITeacherRelative) => {
  return !(
    relative.name?.trim() ||
    relative.phone?.trim() ||
    relative.occupation?.trim()
  );
};

const DEFAULT_TEACHER_INFORMATION: ITeacherInformation = {
  id: undefined,
  place_of_origin: null,
  exempted_group: null,
  priority_group: null,
  citizen_id: null,
  issue_date: null,
  issue_place: null,
  nationality: null,
  ethnicity: null,
  religion: null,
  insurance_number: null,
  student_id: null,
  teacher_id: null,
  bank_name: null,
  bank_account_number: null,
  created_at: undefined,
  updated_at: undefined,
};

const normalizeNullableText = (value?: string | null): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeOptionalUuid = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const DEFAULT_TEACHER: ITeacherResponse = {
  teacher_code: "",
  name: "",
  email: "",
  phone: "",
  date_of_birth: null,
  gender: "1",
  address: "",
  academic_rank: null,
  status: STATUS.ACTIVE,
  department_id: null,
  created_at: "",
  updated_at: "",
  password: "",
  department_code: "",
  department_name: "",
  teacher_information: { ...DEFAULT_TEACHER_INFORMATION },
  teacher_relative: buildRelatives(),
};

const TeacherFormModel: React.FC<TeacherFormModelProps> = ({
  open,
  mode,
  initialValues,
  onClose,
}) => {
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<ITeacherResponse>({ ...DEFAULT_TEACHER });
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [value, setValue] = useState<number>(0);

  const { showSnackbar } = useSnackbar();

  const { data: departments } = useGetDepartment({
    limit: 200,
    skip: 0,
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setTeacher({
        ...DEFAULT_TEACHER,
        ...initialValues,
        gender: initialValues.gender || DEFAULT_TEACHER.gender,
        status: initialValues.status || DEFAULT_TEACHER.status,
        teacher_information: {
          ...DEFAULT_TEACHER_INFORMATION,
          ...initialValues.teacher_information,
        },
        teacher_relative: buildRelatives(initialValues.teacher_relative),
      });
      setDateOfBirth(initialValues.date_of_birth ? new Date(initialValues.date_of_birth) : null);
    } else {
      setTeacher({ ...DEFAULT_TEACHER, teacher_relative: buildRelatives() });
      setDateOfBirth(null);
    }
  }, [initialValues, mode, open]);

  const handleDateChange = (newValue: Date | null) => {
    setDateOfBirth(newValue);
    setTeacher((prev) => ({
      ...prev,
      date_of_birth: newValue ? dayjs(newValue).toISOString() : null,
    }));
  };

  const { mutateAsync: createTeacher } = useCreateTeacher({});
  const { mutateAsync: updateTeacher } = useUpdateTeacher();

  const validateBasicInfo = (): boolean => {
    if (!teacher.teacher_code.trim()) {
      showSnackbar(t("teachers.form.errors.teacherCodeRequired"), "error");
      setValue(0);
      return false;
    }

    if (!teacher.name.trim()) {
      showSnackbar(t("teachers.form.errors.teacherNameRequired"), "error");
      setValue(0);
      return false;
    }

    if (!teacher.email.trim()) {
      showSnackbar(t("teachers.form.errors.emailRequired"), "error");
      setValue(0);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacher.email.trim())) {
      showSnackbar(t("teachers.form.errors.emailInvalid"), "error");
      setValue(0);
      return false;
    }

    return true;
  };

  const handleSubmitClick = async () => {
    if (!validateBasicInfo()) {
      return;
    }

    const teacher_information: ITeacherInformationCreate = {
      citizen_id: normalizeNullableText(teacher.teacher_information?.citizen_id),
      place_of_origin: normalizeNullableText(teacher.teacher_information?.place_of_origin),
      exempted_group: normalizeNullableText(teacher.teacher_information?.exempted_group),
      priority_group: normalizeNullableText(teacher.teacher_information?.priority_group),
      issue_date: teacher.teacher_information?.issue_date ?? null,
      issue_place: normalizeNullableText(teacher.teacher_information?.issue_place),
      nationality: normalizeNullableText(teacher.teacher_information?.nationality),
      ethnicity: normalizeNullableText(teacher.teacher_information?.ethnicity),
      religion: normalizeNullableText(teacher.teacher_information?.religion),
      insurance_number: normalizeNullableText(teacher.teacher_information?.insurance_number),
      bank_name: normalizeNullableText(teacher.teacher_information?.bank_name),
      bank_account_number: normalizeNullableText(teacher.teacher_information?.bank_account_number),
    };

    const teacher_relatives: ITeacherRelativeCreate[] = (teacher.teacher_relative ?? [])
      .filter((relative) => !isRelativeEmpty(relative))
      .map((relative) => ({
        name: normalizeNullableText(relative.name),
        date_of_birth: relative.date_of_birth,
        nationality: normalizeNullableText(relative.nationality),
        ethnicity: normalizeNullableText(relative.ethnicity),
        religion: normalizeNullableText(relative.religion),
        occupation: normalizeNullableText(relative.occupation),
        phone: normalizeNullableText(relative.phone),
        address: normalizeNullableText(relative.address),
        relationship: normalizeNullableText(relative.relationship),
      }));

    const basePayload: ITeacherUpdate = {
      teacher_code: teacher.teacher_code,
      name: teacher.name,
      date_of_birth: teacher.date_of_birth,
      gender: teacher.gender,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      academic_rank: teacher.academic_rank,
      status: teacher.status,
      department_id: normalizeOptionalUuid(teacher.department_id),
      teacher_information,
      teacher_relatives,
      updated_at: dayjs().toISOString(),
    };

    try {
      if (mode === "add") {
        const createPayload: ITeacherCreate = {
          teacher_code: teacher.teacher_code,
          name: teacher.name,
          date_of_birth: teacher.date_of_birth,
          gender: teacher.gender,
          email: teacher.email,
          phone: teacher.phone,
          address: teacher.address,
          academic_rank: teacher.academic_rank,
          status: teacher.status,
          department_id: normalizeOptionalUuid(teacher.department_id),
          teacher_information,
          teacher_relatives,
          password: teacher.teacher_code,
        };
        await createTeacher(createPayload);
      } else if (mode === "edit" && initialValues?.id) {
        await updateTeacher({ id: initialValues.id, data: basePayload });
      }

      showSnackbar(
        mode === "add"
          ? t("teachers.messages.createSuccess")
          : t("teachers.messages.updateSuccess"),
        "success"
      );
      onClose();
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? t("teachers.messages.genericError");
      showSnackbar(detail, "error");
    }
  };

  const handleRelativeUpdate = (index: number, fields: Partial<ITeacherRelative>) => {
    setTeacher((prev) => {
      const base = prev.teacher_relative ? [...prev.teacher_relative] : buildRelatives();
      base[index] = { ...base[index], ...fields };
      return { ...prev, teacher_relative: base };
    });
  };

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    isChanged: false,
    onClose,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const teacherInfo = (teacher.teacher_information || {}) as ITeacherInformation;

  const updateTeacherInfo = (field: keyof ITeacherInformation, value: string | null) => {
    setTeacher((prev) => ({
      ...prev,
      teacher_information: {
        ...(prev.teacher_information || {}),
        [field]: value,
      },
    }));
  };

  const issueDateValue = teacherInfo.issue_date ? new Date(teacherInfo.issue_date) : null;

  return (
    <Dialog
      open={open}
      className="primary-dialog department-form"
      maxWidth="xl"
      fullWidth
      onClose={handleCloseClick}
    >
      <DialogTitle className="primary-dialog-title">
        {mode === "add" ? t("teachers.form.addTitle") : t("teachers.form.editTitle")}
      </DialogTitle>

      <Tabs className="myprofile-tabs" value={value} onChange={handleTabChange}>
        <Tab classes={{ selected: "active-tab" }} label={t("teachers.form.tabs.basic")} />
        <Tab classes={{ selected: "active-tab" }} label={t("teachers.form.tabs.other")} />
        <Tab classes={{ selected: "active-tab" }} label={t("teachers.form.tabs.relative")} />
      </Tabs>

      <DialogContent className="primary-dialog-content">
        <TabPanel value={value} index={0}>
          <Grid container spacing={2} className="myprofile-form">
            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.teacherCode")} required />
              <TextField
                value={teacher.teacher_code}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, teacher_code: event.target.value }))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.teacherName")} required />
              <TextField
                value={teacher.name}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, name: event.target.value }))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.dateOfBirth")} />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={dateOfBirth}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.gender")} required />
              <Select
                value={teacher.gender}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, gender: String(event.target.value) }))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              >
                <MenuItem value="1">{t("common.male")}</MenuItem>
                <MenuItem value="2">{t("common.female")}</MenuItem>
                <MenuItem value="3">{t("common.other")}</MenuItem>
              </Select>
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.email")} required />
              <TextField
                value={teacher.email}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, email: event.target.value }))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.phone")} />
              <TextField
                value={teacher.phone ?? ""}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, phone: event.target.value }))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={12}>
              <LabelPrimary value={t("teachers.form.address")} />
              <TextField
                value={teacher.address ?? ""}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, address: event.target.value }))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.department")} />
              <Select
                value={teacher.department_id ?? ""}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, department_id: String(event.target.value) }))
                }
                fullWidth
                className="main-text__field"
              >
                <MenuItem value="">{t("common.none")}</MenuItem>
                {(departments?.data ?? []).map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.academicRank")} />
              <TextField
                value={teacher.academic_rank ?? ""}
                onChange={(event) =>
                  setTeacher((prev) => ({ ...prev, academic_rank: event.target.value }))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Grid container spacing={2} className="myprofile-form">
            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.placeOfOrigin")} />
              <TextField
                value={teacherInfo.place_of_origin ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("place_of_origin", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.exemptedGroup")} />
              <TextField
                value={teacherInfo.exempted_group ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("exempted_group", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.priorityGroup")} />
              <TextField
                value={teacherInfo.priority_group ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("priority_group", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.citizenId")} />
              <TextField
                value={teacherInfo.citizen_id ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("citizen_id", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.issueDate")} />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={issueDateValue}
                  onChange={(newValue) =>
                    updateTeacherInfo("issue_date", newValue ? newValue.toISOString() : null)
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.issuePlace")} />
              <TextField
                value={teacherInfo.issue_place ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("issue_place", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.nationality")} />
              <TextField
                value={teacherInfo.nationality ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("nationality", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.ethnicity")} />
              <TextField
                value={teacherInfo.ethnicity ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("ethnicity", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.religion")} />
              <TextField
                value={teacherInfo.religion ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("religion", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.insuranceNumber")} />
              <TextField
                value={teacherInfo.insurance_number ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("insurance_number", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.bankName")} />
              <TextField
                value={teacherInfo.bank_name ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("bank_name", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>

            <Grid size={4}>
              <LabelPrimary value={t("teachers.form.bankAccountNumber")} />
              <TextField
                value={teacherInfo.bank_account_number ?? ""}
                onChange={(event) =>
                  updateTeacherInfo("bank_account_number", normalizeNullableText(event.target.value))
                }
                fullWidth
                variant="outlined"
                className="main-text__field"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Grid container spacing={2} className="myprofile-form">
            {(teacher.teacher_relative ?? buildRelatives()).map((relative, index) => {
              const relativeDob = relative.date_of_birth ? new Date(relative.date_of_birth) : null;
              return (
                <React.Fragment key={`relative-${index}`}>
                  <Grid size={12}>
                    <Box className="myprofile-panel__title">
                      {index === 0
                        ? t("teachers.form.relativeSections.father")
                        : index === 1
                          ? t("teachers.form.relativeSections.mother")
                          : t("teachers.form.relativeSections.relative", { index: index + 1 })}
                    </Box>
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativeName")} />
                    <TextField
                      value={relative.name ?? ""}
                      onChange={(event) => handleRelativeUpdate(index, { name: event.target.value })}
                      fullWidth
                      variant="outlined"
                      className="main-text__field"
                    />
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativeDateOfBirth")} />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={relativeDob}
                        onChange={(newValue) =>
                          handleRelativeUpdate(index, {
                            date_of_birth: newValue ? newValue.toISOString() : null,
                          })
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativeOccupation")} />
                    <TextField
                      value={relative.occupation ?? ""}
                      onChange={(event) =>
                        handleRelativeUpdate(index, { occupation: event.target.value })
                      }
                      fullWidth
                      variant="outlined"
                      className="main-text__field"
                    />
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativePhone")} />
                    <TextField
                      value={relative.phone ?? ""}
                      onChange={(event) => handleRelativeUpdate(index, { phone: event.target.value })}
                      fullWidth
                      variant="outlined"
                      className="main-text__field"
                    />
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativeAddress")} />
                    <TextField
                      value={relative.address ?? ""}
                      onChange={(event) => handleRelativeUpdate(index, { address: event.target.value })}
                      fullWidth
                      variant="outlined"
                      className="main-text__field"
                    />
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativeEthnicity")} />
                    <TextField
                      value={relative.ethnicity ?? ""}
                      onChange={(event) => handleRelativeUpdate(index, { ethnicity: event.target.value })}
                      fullWidth
                      variant="outlined"
                      className="main-text__field"
                    />
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativeReligion")} />
                    <TextField
                      value={relative.religion ?? ""}
                      onChange={(event) => handleRelativeUpdate(index, { religion: event.target.value })}
                      fullWidth
                      variant="outlined"
                      className="main-text__field"
                    />
                  </Grid>

                  <Grid size={4}>
                    <LabelPrimary value={t("teachers.form.relativeNationality")} />
                    <TextField
                      value={relative.nationality ?? ""}
                      onChange={(event) =>
                        handleRelativeUpdate(index, { nationality: event.target.value })
                      }
                      fullWidth
                      variant="outlined"
                      className="main-text__field"
                    />
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmitClick} variant="contained">
          {mode === "add" ? t("common.add") : t("common.save")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title={t("common.confirmExitTitle")}
        message={t("teachers.form.confirmExit")}
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />
    </Dialog>
  );
};

export default TeacherFormModel;
