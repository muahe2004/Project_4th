import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Box,
    Grid,
    FormControl,
    OutlinedInput,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useMemo, useState, useEffect, type ReactNode } from "react";
import dayjs from "dayjs";
import { STATUS } from "../../../constants/status";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import type { IStudentsResponse, IStudentRelatives, IStudentInformation, IStudentCreate, IStudentInformationCreate, IStudentRelativesCreate, IStudentUpdate } from "../types";
import BasicInformationTab from "./BasicInformationtab";
import Button from "../../../components/Button/Button";
import OtherInformationTab from "./OtherInformationTab";
import RelativeInformationTab from "./RelativeInformationTab";
import { RELATIONSHIP } from "../../../constants/relationships";
import { useCreateStudent } from "../apis/addStudent";
import { useUpdateStudent } from "../apis/updateStudent";
import { useClassesDropDown } from "../../classes/apis/getClassDropDown";
import { useClassesDropDownByIds } from "../../classes/apis/getClassDropDownByIds";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { getEmailError, getPhoneNumberError, getRequiredError, getStudentCodeError } from "../../../utils/validation/fieldErrors";
import LabelPrimary from "../../../components/Label/Label";

interface TabPanelProps {
    children?: ReactNode;
    value: number;
    index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box sx={{ mt: 3 }}>
                {children}
                </Box>
            )}
        </div>
    );
}

interface StudentFormModelProps {
    open: boolean;
    mode: "add" | "edit";
    initialValues?: IStudentsResponse;
    onClose: () => void;
}

const DEFAULT_RELATIVE: IStudentRelatives = {
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

const buildRelatives = (rels?: IStudentRelatives[]) => {
    const map = new Map<IStudentRelatives["relationship"], IStudentRelatives>();
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

const isRelativeEmpty = (relative: IStudentRelatives) => {
    return !(
        relative.name?.trim() ||
        relative.phone?.trim() ||
        relative.occupation?.trim()
    );
};

const DEFAULT_STUDENT_INFORMATION: IStudentInformation = {
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

const DEFAULT_STUDENT: IStudentsResponse = {
    student_code: "",
    name: "",
    email: "",
    phone: "",
    date_of_birth: null,
    gender: "1",
    address: "",
    training_program: null,
    course: null,
    status: STATUS.ACTIVE,
    class_id: null,
    created_at: "",
    updated_at: "",
    password: "",
    class_code: "",
    class_name: "",
    student_information: { ...DEFAULT_STUDENT_INFORMATION },
    student_relative: buildRelatives(),
};

const StudentFormModel: React.FC<StudentFormModelProps> = ({ open, mode, initialValues, onClose }) => {
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const [student, setStudent] = useState<IStudentsResponse>({ ...DEFAULT_STUDENT });
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

    const [specializationPage, setSpecializationPage] = useState(1);
    const [searchSpecialization, setSearchSpecialization] = useState("");
    const { data: classes = [] } = useClassesDropDown({
        limit: 5,
        skip: (specializationPage - 1) * 5,
        search: searchSpecialization || undefined,
    });
    const { data: selectedClasses = [] } = useClassesDropDownByIds(
        student.class_id ? { ids: [student.class_id] } : { ids: [] }
    );
    const safeClasses = Array.isArray(classes) ? classes : [];
    const safeSelectedClasses = Array.isArray(selectedClasses) ? selectedClasses : [];
    const classOptions = useMemo(
        () => Array.from(new Map([...safeSelectedClasses, ...safeClasses].map((item) => [item.id, item])).values()),
        [safeSelectedClasses, safeClasses]
    );
    const handleClassSearchChange = (value: string) => {
        setSearchSpecialization(value);
        setSpecializationPage(1);
    };
    const handleClassResetPage = () => {
        setSpecializationPage(1);
    };

    useEffect(() => {
        if (mode === "edit" && initialValues) {
            const parsedDateOfBirth = initialValues.date_of_birth ? dayjs(initialValues.date_of_birth) : null;
            setStudent({
                ...DEFAULT_STUDENT,
                ...initialValues,
                gender: initialValues.gender || DEFAULT_STUDENT.gender,
                status: initialValues.status || DEFAULT_STUDENT.status,
                student_information: {
                    ...DEFAULT_STUDENT_INFORMATION,
                    ...initialValues.student_information,
                },
                student_relative: buildRelatives(initialValues.student_relative),
            });
            setDateOfBirth(parsedDateOfBirth && parsedDateOfBirth.isValid() ? parsedDateOfBirth.toDate() : null);
        } else {
            setStudent({ ...DEFAULT_STUDENT, student_relative: buildRelatives() });
            setDateOfBirth(null);
        }
        setEmailError("");
        setPhoneError("");
        setStudentCodeError("");
        setStudentNameError("");
        setRelativePhoneErrors({});
    }, [initialValues, mode, open]);

    const handleDateChange = (newValue: Date | null) => {
        setDateOfBirth(newValue);
        const parsedDate = newValue ? dayjs(newValue) : null;
        setStudent((prev) => ({
            ...prev,
            date_of_birth: parsedDate && parsedDate.isValid() ? parsedDate.toISOString() : null,
        }));
    };

    const { mutateAsync: createStudent } = useCreateStudent({});
    const { mutateAsync: updateStudent } = useUpdateStudent({});

    const validateEmailField = (): { valid: boolean; message: string } => {
        const message = getEmailError(
            student.email,
            t("students.form.errors.emailRequired"),
            t("students.form.errors.emailInvalid")
        );
        setEmailError(message);
        return { valid: !message, message };
    };

    const validatePhoneField = (): { valid: boolean; message: string } => {
        const message = getPhoneNumberError(
            student.phone,
            t("students.form.errors.phoneInvalid")
        );
        setPhoneError(message);
        return { valid: !message, message };
    };

    const validateStudentCodeField = (): { valid: boolean; message: string } => {
        const message = getStudentCodeError(
            student.student_code,
            t("students.form.errors.studentCodeRequired"),
            t("students.form.errors.studentCodeInvalid")
        );
        setStudentCodeError(message);
        return { valid: !message, message };
    };

    const validateStudentNameField = (): { valid: boolean; message: string } => {
        const message = getRequiredError(
            student.name,
            t("students.form.errors.studentNameRequired")
        );
        setStudentNameError(message);
        return { valid: !message, message };
    };

    const validateBasicInfo = (): boolean => {
        const studentCodeValidation = validateStudentCodeField();
        if (!studentCodeValidation.valid) {
            showSnackbar(studentCodeValidation.message, "error");
            setValue(0);
            return false;
        }

        const studentNameValidation = validateStudentNameField();
        if (!studentNameValidation.valid) {
            showSnackbar(studentNameValidation.message, "error");
            setValue(0);
            return false;
        }

        const emailValidation = validateEmailField();
        if (!emailValidation.valid) {
            showSnackbar(emailValidation.message, "error");
            setValue(0);
            return false;
        }

        const phoneValidation = validatePhoneField();
        if (!phoneValidation.valid) {
            showSnackbar(phoneValidation.message, "error");
            setValue(0);
            return false;
        }

        return true;
    };

    const validateRelativePhoneField = (index: number): { valid: boolean; message: string } => {
        const relative = (student.student_relative ?? [])[index];
        const message = getPhoneNumberError(
            relative?.phone,
            t("students.form.errors.phoneInvalid", "Số điện thoại không đúng định dạng")
        );
        setRelativePhoneErrors((prev) => ({ ...prev, [index]: message }));
        return { valid: !message, message };
    };

    const validateAllRelativePhones = (): boolean => {
        const relatives = student.student_relative ?? [];
        const nextErrors: Record<number, string> = {};
        let firstInvalidIndex = -1;

        relatives.forEach((relative, index) => {
            const message = getPhoneNumberError(
                relative.phone,
                t("students.form.errors.phoneInvalid")
            );
            nextErrors[index] = message;
            if (message && firstInvalidIndex === -1) {
                firstInvalidIndex = index;
            }
        });

        setRelativePhoneErrors(nextErrors);
        if (firstInvalidIndex !== -1) {
            setValue(2);
            showSnackbar(nextErrors[firstInvalidIndex], "error");
            return false;
        }
        return true;
    };

    const handleSubmitClick = async () => {
        if (!validateBasicInfo()) {
            return;
        }
        if (!validateAllRelativePhones()) {
            return;
        }
        const passwordValidation = validatePasswordTab();
        if (!passwordValidation.valid) {
            setPasswordError(passwordValidation.message);
            showSnackbar(passwordValidation.message, "error");
            return;
        }
        setPasswordError("");

        const student_information: IStudentInformationCreate = {
            citizen_id: normalizeNullableText(student.student_information?.citizen_id),
            place_of_origin: normalizeNullableText(student.student_information?.place_of_origin),
            exempted_group: normalizeNullableText(student.student_information?.exempted_group),
            priority_group: normalizeNullableText(student.student_information?.priority_group),
            issue_date: student.student_information?.issue_date ?? null,
            issue_place: normalizeNullableText(student.student_information?.issue_place),
            nationality: normalizeNullableText(student.student_information?.nationality),
            ethnicity: normalizeNullableText(student.student_information?.ethnicity),
            religion: normalizeNullableText(student.student_information?.religion),
            insurance_number: normalizeNullableText(student.student_information?.insurance_number),
            bank_name: normalizeNullableText(student.student_information?.bank_name),
            bank_account_number: normalizeNullableText(student.student_information?.bank_account_number),
        };

        const student_relatives: IStudentRelativesCreate[] = (
            student.student_relative ?? [])
                .filter((r) => !isRelativeEmpty(r))
                .map((r) => ({
                    name: r.name,
                    date_of_birth: r.date_of_birth,
                    nationality: r.nationality,
                    ethnicity: r.ethnicity,
                    religion: r.religion,
                    occupation: r.occupation,
                    phone: r.phone,
                    address: r.address,
                    relationship: r.relationship,
                }));

        const basePayload: IStudentUpdate = {
            student_code: student.student_code,
            name: student.name,
            date_of_birth: student.date_of_birth,
            gender: student.gender,
            email: student.email,
            phone: student.phone,
            address: student.address,
            class_id: normalizeOptionalUuid(student.class_id),
            training_program: student.training_program,
            course: student.course,
            status: student.status,
            ...(mode === "edit" && newPassword ? { password: newPassword } : {}),

            student_information: student_information,
            student_relatives: student_relatives,
        };

        if (mode === "add") {
            const createPayload: IStudentCreate = {
                student_code: student.student_code,
                name: student.name,
                date_of_birth: student.date_of_birth,
                gender: student.gender,
                email: student.email,
                phone: student.phone,
                address: student.address,
                class_id: normalizeOptionalUuid(student.class_id),
                training_program: student.training_program,
                course: student.course,
                status: student.status,
                student_information: student_information,
                student_relatives: student_relatives,
                password: student.student_code,
            };
            await createStudent(createPayload);
        } else if (mode === "edit" && initialValues?.id) {
            await updateStudent({
                studentId: initialValues.id,
                data: basePayload,
            });
            if (newPassword) {
                showSnackbar(t("students.form.passwordChangedSuccess"), "success");
            }
        }
        onClose();
    };

    const handleRelativeUpdate = (index: number, fields: Partial<IStudentRelatives>) => {
        setStudent((prev) => {
            const base = prev.student_relative ? [...prev.student_relative] : buildRelatives();
            base[index] = { ...base[index], ...fields };
            return { ...prev, student_relative: base };
        });
    };

    const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
        mode,
        isChanged: false,
        onClose,
    });

    const [value, setValue] = useState<number>(0);
    const [studentCodeError, setStudentCodeError] = useState<string>("");
    const [studentNameError, setStudentNameError] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");
    const [relativePhoneErrors, setRelativePhoneErrors] = useState<Record<number, string>>({});
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const validatePasswordTab = (): { valid: boolean; message: string } => {
        if (mode !== "edit") return { valid: true, message: "" };
        if (!newPassword && !confirmPassword) return { valid: true, message: "" };
        if (!newPassword || !confirmPassword) {
            setValue(3);
            return { valid: false, message: t("students.form.errors.passwordRequired") };
        }
        if (newPassword !== confirmPassword) {
            setValue(3);
            return { valid: false, message: t("students.form.errors.passwordMismatch") };
        }
        return { valid: true, message: "" };
    };

    return (
        <Dialog
            open={open}
            className="primary-dialog department-form"
            maxWidth="xl"
            fullWidth
            onClose={handleCloseClick}
        >
            <DialogTitle className="primary-dialog-title">
                {mode === "add" ? t("students.form.titleAdd") : t("students.form.titleEdit")}
            </DialogTitle>

            <Tabs className="myprofile-tabs" value={value} onChange={handleChange}>
                <Tab classes={{ selected: "active-tab" }} label={t("students.tabs.basic")} />
                <Tab classes={{ selected: "active-tab" }} label={t("students.tabs.other")} />
                <Tab classes={{ selected: "active-tab" }} label={t("students.tabs.relatives")} />
                {mode === "edit" && (
                    <Tab classes={{ selected: "active-tab" }} label={t("students.tabs.password")} />
                )}
            </Tabs>

            <DialogContent className="primary-dialog-content">
                <TabPanel value={value} index={0}>
                <BasicInformationTab
                    student={student}
                    classes={classOptions}
                    dateOfBirth={dateOfBirth}
                    onStudentChange={setStudent}
                    onDateChange={handleDateChange}
                    onClassSearchChange={handleClassSearchChange}
                    onClassResetPage={handleClassResetPage}
                    studentCodeError={studentCodeError}
                    onStudentCodeFocus={() => setStudentCodeError("")}
                    onStudentCodeBlur={() => {
                        validateStudentCodeField();
                    }}
                    studentNameError={studentNameError}
                    onStudentNameFocus={() => setStudentNameError("")}
                    onStudentNameBlur={() => {
                        validateStudentNameField();
                    }}
                    emailError={emailError}
                    onEmailFocus={() => setEmailError("")}
                    onEmailBlur={() => {
                        validateEmailField();
                    }}
                    phoneError={phoneError}
                    onPhoneFocus={() => setPhoneError("")}
                    onPhoneBlur={() => {
                        validatePhoneField();
                    }}
                />
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <OtherInformationTab
                        student={student}
                        onStudentChange={setStudent}
                    />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <RelativeInformationTab
                        relatives={student.student_relative ?? buildRelatives()}
                        onRelativeChange={handleRelativeUpdate}
                        phoneErrors={relativePhoneErrors}
                        onPhoneFocus={(index) =>
                            setRelativePhoneErrors((prev) => ({ ...prev, [index]: "" }))
                        }
                        onPhoneBlur={(index) => {
                            validateRelativePhoneField(index);
                        }}
                    />
                </TabPanel>
                {mode === "edit" && (
                    <TabPanel value={value} index={3}>
                        <Grid container spacing={2} className="myprofile-form">
                            <Grid size={6}>
                                <LabelPrimary value={t("students.form.newPassword")} />
                                <FormControl fullWidth variant="outlined" className="main-text__field">
                                    <OutlinedInput
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setPasswordError("");
                                        }}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={showNewPassword ? t("signIn.passwordAria.hide") : t("signIn.passwordAria.show")}
                                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                                    edge="end"
                                                >
                                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={6}>
                                <LabelPrimary value={t("students.form.confirmPassword")} />
                                <FormControl fullWidth variant="outlined" className="main-text__field">
                                    <OutlinedInput
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setPasswordError("");
                                        }}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={showConfirmPassword ? t("signIn.passwordAria.hide") : t("signIn.passwordAria.show")}
                                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                                {passwordError && (
                                    <Box sx={{ color: "#d32f2f", fontSize: "0.75rem", mt: 0.5, ml: 1.75 }}>
                                        {passwordError}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </TabPanel>
                )}
            </DialogContent>
            <DialogActions className="primary-dialog-actions">
                <Button onClick={handleCloseClick} className="button-cancel">{t("students.common.cancel")}</Button>
                <Button onClick={handleSubmitClick} variant="contained">
                    {mode === "add" ? t("students.common.add") : t("students.common.save")}
                </Button>
            </DialogActions>

            {/* Confirm thoát nếu không thay đổi */}
            <ConfirmDialog
                open={openConfirm}
                title={t("students.confirm.exitTitle")}
                message={t("students.confirm.exitMessage")}
                onConfirm={() => {
                    setOpenConfirm(false);
                    onClose();
                }}
                onCancel={() => setOpenConfirm(false)}
            />

        </Dialog>
    );
};

export default StudentFormModel;
