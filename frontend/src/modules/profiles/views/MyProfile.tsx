import { Box, MenuItem, Select, Tabs, Tab, TextField, Typography, Grid } from "@mui/material";
import "./styles/MyProfile.css"
import { useTranslation } from "react-i18next";
import LabelPrimary from "../../../components/Label/Label"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import defaultUser from "../../../assets/images/default-user.png"
import { useEffect, useState, type ReactNode } from "react";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useGetTeacherProfile, useGetStudentProfile } from "../apis/getProfile";
import { useGetProfileTeacher, useGetProfileStudent } from "../apis/getUserInformation";
import { useGetDepartment } from "../../department/apis/getDepartments";

import { ROLES } from "../../../constants/roles"

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

export function MyProfile() {
    const { t } = useTranslation();

    const [value, setValue] = useState<number>(0);

    const user = useAuthStore((state) => state.user); 

    const isTeacher = user?.role === ROLES.TEACHER;
    const isStudent = user?.role === ROLES.STUDENT;

    // const { data: department, isLoading: isLoadingDeparment, error: errorDepatment } = useGetDepartment();
    const { data: teacherInfo, isLoading: isLoadingTeacher, error: errorTeacher } = useGetProfileTeacher(user?.id, isTeacher);
    const { data: studentInfo, isLoading: isLoadingStudent, error: errorStudent } = useGetProfileStudent(user?.id, isStudent);
    const { data: profile, isLoading: isLoadingProfile, error } = useGetTeacherProfile(user?.id, isTeacher);
    const { data: profileStudent, isLoading: isLoadingStudentProfile, error: errStudentProfile } = useGetStudentProfile(user?.id, isStudent); 

    const isLoading = isLoadingProfile || isLoadingStudentProfile || isLoadingTeacher;
    // const isLoading = isLoadingProfile || isLoadingStudentProfile || isLoadingTeacher || isLoadingDeparment;


    // Profile
    const [teacherCode, setTeacherCode] = useState("");
    const [studentCode, setStudentCode] = useState("");
    const [name, setName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState(""); 
    const [gender, setGender] = useState("1"); 
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [academicRank, setAcademicRank] = useState("");
    const [classID, setClassID] = useState("");
    const [course, setCourse] = useState("");
    const [trainingProgram, setTrainingProgram] = useState("");
    const [status, setStatus] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [updatedAt, setUpdatedAt] = useState("");
    
    // user infomation
    const [placeOfOrigin, setPlaceOfOrigin] = useState("");
    const [exemptedGroup, setExemptedGroup] = useState("");
    const [priorityGroup, setPriorityGroup] = useState("");
    const [citizenId, setCitizenId] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [issuePlace, setIssuePlace] = useState("");
    const [nationality, setNationality] = useState("");
    const [ethnicity, setEthnicity] = useState("");
    const [religion, setReligion] = useState("");
    const [insuranceNumber, setInsuranceNumber] = useState("");
    const [studentId, setStudentId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [updatedUserInfomationAt, setUpdatedUserInfomationAt] = useState("");
    const [idUserInformation, setIdUserInformation] = useState("");

    useEffect(() => {
        if (isTeacher) {
            if (!isLoadingProfile && profile) {
                setTeacherCode(profile.teacher_code ?? "");
                setName(profile.name ?? "");
                setDateOfBirth(profile.date_of_birth ?? "");
                setGender(profile.gender ?? "");
                setEmail(profile.email ?? "");
                setPhone(profile.phone ?? "");
                setAddress(profile.address ?? "");
                setAcademicRank(profile.academic_rank ?? "");
                setStatus(profile.status ?? "");
                setDepartmentId(profile.department_id ?? "");
                setUpdatedAt(profile.updated_at ?? "");
            }
        } else {
            if (!isLoadingStudentProfile && profileStudent) {
                setStudentCode(profileStudent.student_code ?? "");
                setName(profileStudent.name ?? "");
                setDateOfBirth(profileStudent.date_of_birth ?? "");
                setGender(profileStudent.gender ?? "");
                setEmail(profileStudent.email ?? "");
                setPhone(profileStudent.phone ?? "");
                setAddress(profileStudent.address ?? "");
                setClassID(profileStudent.class_id ?? "");
                setStatus(profileStudent.status ?? "");
                setCourse(profileStudent.course ?? "");
                setTrainingProgram(profileStudent.training_program ?? "");
                setUpdatedAt(profileStudent.updated_at ?? "");
            }
        }
    }, [profile, isLoadingProfile, profileStudent, isLoadingStudentProfile]);

    // if (error) return <div>Error: {error.message}</div>;

    useEffect(() => {
        if (isTeacher) {
            if (!isLoadingTeacher && teacherInfo) {
                setPlaceOfOrigin(teacherInfo.place_of_origin ?? "");
                setExemptedGroup(teacherInfo.exempted_group ?? "");
                setPriorityGroup(teacherInfo.priority_group ?? "");
                setCitizenId(teacherInfo.citizen_id ?? "");
                setIssueDate(teacherInfo.issue_date ?? "");
                setIssuePlace(teacherInfo.issue_place ?? "");
                setNationality(teacherInfo.nationality ?? "");
                setEthnicity(teacherInfo.ethnicity ?? "");
                setReligion(teacherInfo.religion ?? "");
                setInsuranceNumber(teacherInfo.insurance_number ?? "");
                setTeacherId(teacherInfo.teacher_id ?? "");
                setBankName(teacherInfo.bank_name ?? "");
                setBankAccountNumber(teacherInfo.bank_account_number ?? "");
                setUpdatedUserInfomationAt(teacherInfo.updated_at ?? "");
                setIdUserInformation(teacherInfo.id ?? "");
            }
        } else {
            if (!isLoadingStudent && studentInfo) {
                setPlaceOfOrigin(studentInfo.place_of_origin ?? "");
                setExemptedGroup(studentInfo.exempted_group ?? "");
                setPriorityGroup(studentInfo.priority_group ?? "");
                setCitizenId(studentInfo.citizen_id ?? "");
                setIssueDate(studentInfo.issue_date ?? "");
                setIssuePlace(studentInfo.issue_place ?? "");
                setNationality(studentInfo.nationality ?? "");
                setEthnicity(studentInfo.ethnicity ?? "");
                setReligion(studentInfo.religion ?? "");
                setInsuranceNumber(studentInfo.insurance_number ?? "");
                setStudentId(studentInfo.student_id ?? "");
                setBankName(studentInfo.bank_name ?? "");
                setBankAccountNumber(studentInfo.bank_account_number ?? "");
                setUpdatedUserInfomationAt(studentInfo.updated_at ?? "");
                setIdUserInformation(studentInfo.id ?? "");
            }
        }        
    }, [teacherInfo, isLoadingTeacher]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleSaveInfor = () => {
        const payload = {

        }

        console.log("Information: ", payload);
    }

    return (
        <Box className="myprofile">
            {
                isLoading && (<Loading></Loading>)
            }

            <Typography className="primary-title">
                {t('myprofile.title')}
            </Typography>

            {/* Tabs */}
            <Tabs className="myprofile-tabs" value={value} onChange={handleChange}>
                <Tab classes={{ selected: "active-tab" }} label="Thông tin cá nhân" />
                <Tab classes={{ selected: "active-tab" }} label="Thông tin người thân" />
                <Tab classes={{ selected: "active-tab" }} label="Đổi mật khẩu" />
            </Tabs>

            {/* Thông tin cá nhân */}
            <TabPanel value={value} index={0}>
                <div className="myprofile-flex">
                    <div className="myprofile-box">
                        <img src={defaultUser} className="myprofile-avatar" alt="" />

                        <div className="myprofile-info">
                            <Typography className="myprofile-name">
                                {isTeacher ? (
                                    `${name} - ${teacherCode}`
                                ) : (
                                    `${name} - ${studentCode}`
                                )}
                            </Typography>
                            <Typography className="myprofile-email">
                                {email}
                            </Typography>
                        </div>
                    </div>
                </div>

                <Grid container spacing={2} className="myprofile-form">
                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch"></LabelPrimary>
                        <TextField 
                            value={nationality} 
                            onChange={(e) => setNationality(e.target.value)} 
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid>                    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc"></LabelPrimary>
                        <TextField 
                            value={ethnicity}
                            onChange={(e) => setEthnicity(e.target.value)} 
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField 
                            value={religion}
                            onChange={(e) => setReligion(e.target.value)} 
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Sinh nhật"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                disabled
                                value={dateOfBirth ? new Date(dateOfBirth) : null} 
                                onChange={(newValue) => setDateOfBirth(newValue ? newValue.toISOString() : "")}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Giới tính"></LabelPrimary>
                        <Select
                            disabled
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            fullWidth
                            id="outlined-select"
                            variant="outlined"
                            className="main-text__field"
                            defaultValue=""
                            MenuProps={{
                                disableScrollLock: true,   
                            }}
                        >
                            <MenuItem value="1">Male</MenuItem>
                            <MenuItem value="2">Famale</MenuItem>
                            <MenuItem value="3">Other</MenuItem>
                        </Select>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Email"></LabelPrimary>
                        <TextField 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={6} className="myprofile-form__group myprofile-form__group--fullwidth">
                        <LabelPrimary value="Địa chỉ"></LabelPrimary>
                        <TextField 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Quê quán"></LabelPrimary>
                        <TextField 
                            value={placeOfOrigin}
                            onChange={(e) => setPlaceOfOrigin(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    {
                        isStudent && (
                            <Grid size={4} className="myprofile-form__group">
                                <LabelPrimary value="Chương trình đào tạo" required></LabelPrimary>
                                <TextField 
                                    value={trainingProgram} 
                                    onChange={(e) => setTrainingProgram(e.target.value)} 
                                    fullWidth 
                                    id="outlined-basic" 
                                    variant="outlined" 
                                    className="main-text__field"/>
                            </Grid> 
                        )
                    }

                    {
                        isStudent && (
                            <Grid size={4} className="myprofile-form__group">
                                <LabelPrimary value="Niên khoá" required></LabelPrimary>
                                <TextField 
                                    value={course} 
                                    onChange={(e) => setCourse(e.target.value)} 
                                    fullWidth 
                                    id="outlined-basic" 
                                    variant="outlined" 
                                    className="main-text__field"/>
                            </Grid> 
                        )
                    }

                    {
                        isTeacher && (
                            <Grid size={4} className="myprofile-form__group">
                                <LabelPrimary value="Học vị"></LabelPrimary>
                                <Select
                                    fullWidth
                                    id="outlined-select"
                                    variant="outlined"
                                    className="main-text__field"
                                    defaultValue=""
                                    MenuProps={{
                                        disableScrollLock: true,   
                                    }}
                                >
                                    <MenuItem value="option1">Cử nhân</MenuItem>
                                    <MenuItem value="option2">Thạc sĩ</MenuItem>
                                    <MenuItem value="option3">Tiến sĩ</MenuItem>
                                </Select>
                            </Grid>
                        )
                    }

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Khoa"></LabelPrimary>
                        <Select
                            fullWidth
                            id="outlined-select"
                            variant="outlined"
                            className="main-text__field"
                            defaultValue=""
                            MenuProps={{
                                disableScrollLock: true,   
                            }}
                        >
                            {/* {
                                department?.map((department) => (
                                    <MenuItem value={department.id}>{department.name}</MenuItem>
                                ))
                            } */}
                        </Select>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Lớp"></LabelPrimary>
                        <Select
                            fullWidth
                            id="outlined-select"
                            variant="outlined"
                            className="main-text__field"
                            defaultValue=""
                            MenuProps={{
                                disableScrollLock: true,   
                            }}
                            disabled
                        >
                            {/* {
                                department?.map((department) => (
                                    <MenuItem value={department.id}>{department.name}</MenuItem>
                                ))
                            } */}
                        </Select>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số CCCD" required></LabelPrimary>
                        <TextField 
                            value={citizenId}
                            onChange={(e) => setCitizenId(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Ngày cấp"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                value={issueDate ? new Date(issueDate) : null} 
                                onChange={(newValue) => setIssueDate(newValue ? newValue.toISOString() : "")}
                                className="main-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Nơi cấp" required></LabelPrimary>
                        <TextField 
                            value={issuePlace}
                            onChange={(e) => setIssuePlace(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số BHXH" required></LabelPrimary>
                        <TextField 
                            value={insuranceNumber}
                            onChange={(e) => setInsuranceNumber(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tên ngân hàng" required></LabelPrimary>
                        <TextField 
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số tài khoản" required></LabelPrimary>
                        <TextField 
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Đối tượng miễn giảm" required></LabelPrimary>
                        <TextField 
                            value={exemptedGroup}
                            onChange={(e) => setExemptedGroup(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Đối tượng ưu tiên" required></LabelPrimary>
                        <TextField 
                            value={priorityGroup}
                            onChange={(e) => setPriorityGroup(e.target.value)}
                            fullWidth 
                            id="outlined-basic" 
                            variant="outlined" 
                            className="main-text__field"/>
                    </Grid> 

                    <Grid size={12} className="myprofile-form__actions">
                        <Button className="home-flex__button">Lưu thông tin</Button>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Thông tin người thân */}
            <TabPanel value={value} index={1}>
                <Grid container spacing={2} className="myprofile-form">
                    {/* Bố */}
                    <Grid size={12}>
                        <Typography className="myprofile-panel__title">
                            THÔNG TIN CỦA BỐ
                        </Typography>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Họ và tên bố" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Năm sinh"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="main-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>  

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Địa chỉ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>   

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Nghề nghiệp cha" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>   

                    {/* Mẹ */}
                    <Grid size={12}>
                        <Typography className="myprofile-panel__title">
                            THÔNG TIN CỦA MẸ
                        </Typography>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Họ và tên mẹ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Năm sinh"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="main-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>  

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Địa chỉ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>   

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Nghề nghiệp mẹ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>

                    {/* Vợ hoặc chồng */}
                    <Grid size={12}>
                        <Typography className="myprofile-panel__title">
                            THÔNG TIN CỦA VỢ/CHỒNG
                        </Typography>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Họ và tên vợ/chồng" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Năm sinh"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="main-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>  

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Địa chỉ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>   

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Nghề nghiệp vợ/chồng" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>

                    <Grid size={12} className="myprofile-form__actions">
                        <Button className="home-flex__button">Lưu thông tin</Button>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Đổi mật khẩu */}
            <TabPanel value={value} index={2}>
                <Grid container spacing={2} className="myprofile-form">
                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Mật khẩu cũ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Mật khẩu mới" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Xác nhận mật khẩu mới" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Mã xác nhận" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="main-text__field"/>
                    </Grid>  

                    <Grid size={12} className="myprofile-form__actions">
                        <Button className="home-flex__button">Đổi mật khẩu</Button>
                    </Grid>  
                </Grid>
            </TabPanel>                           
        </Box>
    );
}

export default MyProfile;