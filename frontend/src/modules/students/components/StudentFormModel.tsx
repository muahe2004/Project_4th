import { Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Box } from "@mui/material";
import React, { useState, useEffect, type ReactNode } from "react";
import dayjs from "dayjs";
import { STATUS } from "../../../constants/status";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import type { IStudentsResponse, IStudentRelatives, IStudentInformation, IStudentCreate, IStudentInformationCreate, IStudentRelativesCreate } from "../types";
import BasicInformationTab from "./BasicInformationtab";
import Button from "../../../components/Button/Button";
import OtherInformationTab from "./OtherInformationTab";
import RelativeInformationTab from "./RelativeInformationTab";
import { RELATIONSHIP } from "../../../constants/relationships";
import { useCreateStudent } from "../apis/addStudent";
import { useClassesDropDown } from "../../classes/apis/getClassDropDown";

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
        relative.relationship?.trim() ||
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
    class_id: "",
    created_at: "",
    updated_at: "",
    password: "",
    class_code: "",
    class_name: "",
    student_information: { ...DEFAULT_STUDENT_INFORMATION },
    student_relative: buildRelatives(),
};

const StudentFormModel: React.FC<StudentFormModelProps> = ({ open, mode, initialValues, onClose }) => {

    const [student, setStudent] = useState<IStudentsResponse>({ ...DEFAULT_STUDENT });
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

    const [specializationPage, setSpecializationPage] = useState(1);
    const [searchSpecialization, setSearchSpecialization] = useState("");
    const { data: classes = [] } = useClassesDropDown({
        limit: 5,
        skip: (specializationPage - 1) * 5,
        search: searchSpecialization || undefined,
    });
    const handleClassSearchChange = (value: string) => {
        setSearchSpecialization(value);
        setSpecializationPage(1);
    };
    const handleClassResetPage = () => {
        setSpecializationPage(1);
    };

    useEffect(() => {
        console.log(classes);

        if (mode === "edit" && initialValues) {
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
            setDateOfBirth(initialValues.date_of_birth ? new Date(initialValues.date_of_birth) : null);
        } else {
            setStudent({ ...DEFAULT_STUDENT, student_relative: buildRelatives() });
            setDateOfBirth(null);
        }
    }, [initialValues, mode, open]);

    const handleDateChange = (newValue: Date | null) => {
        setDateOfBirth(newValue);
        setStudent((prev) => ({
            ...prev,
            date_of_birth: newValue ? dayjs(newValue).toISOString() : null,
        }));
    };

    const { mutateAsync: createStudent } = useCreateStudent({})

    const handleSubmitClick = async () => {

        const student_information: IStudentInformationCreate = {
            citizen_id: student.student_information?.citizen_id ?? null,
            issue_date: student.student_information?.issue_date ?? null,
            issue_place: student.student_information?.issue_place ?? null,
            nationality: student.student_information?.nationality ?? null,
            ethnicity: student.student_information?.ethnicity ?? null,
            religion: student.student_information?.religion ?? null,
            insurance_number: student.student_information?.insurance_number ?? null,
            bank_name: student.student_information?.bank_name ?? null,
            bank_account_number: student.student_information?.bank_account_number ?? null,
        }

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

        const payload: IStudentCreate = {
            student_code: student.student_code,
            name: student.name,
            date_of_birth: student.date_of_birth,
            gender: student.gender,
            email: student.email,
            phone: student.phone,
            address: student.address,
            class_id: student.class_id,
            training_program: student.training_program,
            course: student.course,
            status: student.status,

            student_information: student_information,
            student_relatives: student_relatives,

            ...(mode === "add" && { password: student.student_code }) // if mode add included password
        };

        if (mode === "add") await createStudent(payload)
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

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
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
                {mode === "add" ? "ADD STUDENT" : "SỬA THÔNG TIN"}
            </DialogTitle>

            <Tabs className="myprofile-tabs" value={value} onChange={handleChange}>
                <Tab classes={{ selected: "active-tab" }} label="Thông tin cơ bản" />
                <Tab classes={{ selected: "active-tab" }} label="Thông tin khác" />
                <Tab classes={{ selected: "active-tab" }} label="Thông tin người thân" />
            </Tabs>

            <DialogContent className="primary-dialog-content">
                <TabPanel value={value} index={0}>
                <BasicInformationTab
                    student={student}
                    classes={classes}
                    dateOfBirth={dateOfBirth}
                    onStudentChange={setStudent}
                    onDateChange={handleDateChange}
                    onClassSearchChange={handleClassSearchChange}
                    onClassResetPage={handleClassResetPage}
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
                    />
                </TabPanel>
            </DialogContent>
            <DialogActions className="primary-dialog-actions">
                <Button onClick={handleCloseClick} className="button-cancel">Hủy</Button>
                <Button onClick={handleSubmitClick} variant="contained">
                    {mode === "add" ? "Thêm" : "Lưu"}
                </Button>
            </DialogActions>

            {/* Confirm thoát nếu không thay đổi */}
            <ConfirmDialog
                open={openConfirm}
                title="Xác nhận thoát"
                message="Bạn có chắc muốn thoát? Dữ liệu đang nhập sẽ không được lưu."
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