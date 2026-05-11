import { MenuItem, Select, TextField, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import defaultUser from "../../../assets/images/default-user.png";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import LabelPrimary from "../../../components/Label/Label";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useGetTeacherProfile, useGetStudentProfile } from "../apis/getProfile";
import { useGetCurrentUserInformation } from "../apis/getUserInformation";
import {
  useUpdateStudentProfile,
  useUpdateTeacherProfile,
} from "../apis/updateProfile";
import { ROLES } from "../../../constants/roles";

export default function Information() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { showSnackbar } = useSnackbar();
  const isTeacher = user?.role === ROLES.TEACHER;
  const isStudent = user?.role === ROLES.STUDENT;

  const { data: currentUserInformation } = useGetCurrentUserInformation(Boolean(user?.id));
  const { data: profile, isLoading: isLoadingProfile } = useGetTeacherProfile(
    user?.id,
    isTeacher
  );
  const { data: profileStudent, isLoading: isLoadingStudentProfile } = useGetStudentProfile(
    user?.id,
    isStudent
  );
  const updateTeacherProfile = useUpdateTeacherProfile();
  const updateStudentProfile = useUpdateStudentProfile();

  const isLoading = isTeacher ? isLoadingProfile : isLoadingStudentProfile;
  const isSaving = updateTeacherProfile.isPending || updateStudentProfile.isPending;

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
  const [departmentId, setDepartmentId] = useState("");

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
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  useEffect(() => {
    if (isTeacher) {
      if (profile) {
        setTeacherCode(profile.teacher_code ?? "");
        setName(profile.name ?? "");
        setDateOfBirth(profile.date_of_birth ?? "");
        setGender(profile.gender ?? "");
        setEmail(profile.email ?? "");
        setPhone(profile.phone ?? "");
        setAddress(profile.address ?? "");
        setAcademicRank(profile.academic_rank ?? "");
        setDepartmentId(profile.department_id ?? "");
      }
    } else if (profileStudent) {
      setStudentCode(profileStudent.student_code ?? "");
      setName(profileStudent.name ?? "");
      setDateOfBirth(profileStudent.date_of_birth ?? "");
      setGender(profileStudent.gender ?? "");
      setEmail(profileStudent.email ?? "");
      setPhone(profileStudent.phone ?? "");
      setAddress(profileStudent.address ?? "");
      setClassID(profileStudent.class_id ?? "");
      setCourse(profileStudent.course ?? "");
      setTrainingProgram(profileStudent.training_program ?? "");
    }
  }, [isTeacher, profile, profileStudent]);

  useEffect(() => {
    if (!currentUserInformation) {
      return;
    }

    setPlaceOfOrigin(currentUserInformation.place_of_origin ?? "");
    setExemptedGroup(currentUserInformation.exempted_group ?? "");
    setPriorityGroup(currentUserInformation.priority_group ?? "");
    setCitizenId(currentUserInformation.citizen_id ?? "");
    setIssueDate(currentUserInformation.issue_date ?? "");
    setIssuePlace(currentUserInformation.issue_place ?? "");
    setNationality(currentUserInformation.nationality ?? "");
    setEthnicity(currentUserInformation.ethnicity ?? "");
    setReligion(currentUserInformation.religion ?? "");
    setInsuranceNumber(currentUserInformation.insurance_number ?? "");
    setBankName(currentUserInformation.bank_name ?? "");
    setBankAccountNumber(currentUserInformation.bank_account_number ?? "");
  }, [currentUserInformation]);

  const handleSaveInformation = async () => {
    const tasks: Promise<unknown>[] = [];

    if (isTeacher && profile?.id) {
      tasks.push(
        updateTeacherProfile.mutateAsync({
          id: profile.id,
          data: {
            name,
            date_of_birth: dateOfBirth || null,
            gender,
            email,
            phone,
            address,
            academic_rank: academicRank,
            department_id: departmentId || null,
            teacher_information: {
              place_of_origin: placeOfOrigin || null,
              exempted_group: exemptedGroup || null,
              priority_group: priorityGroup || null,
              citizen_id: citizenId || null,
              issue_date: issueDate || null,
              issue_place: issuePlace || null,
              nationality: nationality || null,
              ethnicity: ethnicity || null,
              religion: religion || null,
              insurance_number: insuranceNumber || null,
              bank_name: bankName || null,
              bank_account_number: bankAccountNumber || null,
            },
          },
        })
      );
    }

    if (isStudent && profileStudent?.id) {
      tasks.push(
        updateStudentProfile.mutateAsync({
          id: profileStudent.id,
          data: {
            name,
            date_of_birth: dateOfBirth || null,
            gender,
            email,
            phone,
            address,
            class_id: classID || null,
            training_program: trainingProgram,
            course,
            student_information: {
              place_of_origin: placeOfOrigin || null,
              exempted_group: exemptedGroup || null,
              priority_group: priorityGroup || null,
              citizen_id: citizenId || null,
              issue_date: issueDate || null,
              issue_place: issuePlace || null,
              nationality: nationality || null,
              ethnicity: ethnicity || null,
              religion: religion || null,
              insurance_number: insuranceNumber || null,
              bank_name: bankName || null,
              bank_account_number: bankAccountNumber || null,
            },
          },
        })
      );
    }

    try {
      await Promise.all(tasks);
      showSnackbar(t("myprofile.messages.updateSuccess"), "success");
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        t("myprofile.messages.genericError");
      showSnackbar(detail, "error");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="myprofile-flex">
        <div className="myprofile-box">
          <img src={defaultUser} className="myprofile-avatar" alt="" />

          <div className="myprofile-info">
            <Typography className="myprofile-name">
              {isTeacher ? `${name} - ${teacherCode}` : `${name} - ${studentCode}`}
            </Typography>
            <Typography className="myprofile-email">{email}</Typography>
          </div>
        </div>
      </div>

      <Grid container spacing={2} className="myprofile-form">
        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.nationality")} />
          <TextField
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.ethnicity")} />
          <TextField
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.religion")} required />
          <TextField
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.dateOfBirth")} />
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
          <LabelPrimary value={t("myprofile.fields.gender")} />
          <Select
            disabled
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="1">{t("myprofile.gender.male")}</MenuItem>
            <MenuItem value="2">{t("myprofile.gender.female")}</MenuItem>
            <MenuItem value="3">{t("myprofile.gender.other")}</MenuItem>
          </Select>
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.email")} />
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={6} className="myprofile-form__group myprofile-form__group--fullwidth">
          <LabelPrimary value={t("myprofile.fields.address")} />
          <TextField
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={6} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.placeOfOrigin")} />
          <TextField
            value={placeOfOrigin}
            onChange={(e) => setPlaceOfOrigin(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.phone")} required />
          <TextField
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        {isStudent && (
          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value={t("myprofile.fields.trainingProgram")} required />
            <TextField
              value={trainingProgram}
              onChange={(e) => setTrainingProgram(e.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
        )}

        {isStudent && (
          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value={t("myprofile.fields.course")} required />
            <TextField
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </Grid>
        )}

        {isTeacher && (
          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value={t("myprofile.fields.academicRank")} />
            <Select
              fullWidth
              value={academicRank}
            onChange={(e) => setAcademicRank(e.target.value)}
            variant="outlined"
            className="main-text__field"
            MenuProps={{ disableScrollLock: true }}
          >
              <MenuItem value="option1">{t("myprofile.academicRank.bachelor")}</MenuItem>
              <MenuItem value="option2">{t("myprofile.academicRank.master")}</MenuItem>
              <MenuItem value="option3">{t("myprofile.academicRank.doctor")}</MenuItem>
            </Select>
          </Grid>
        )}

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.department")} />
          <Select
            fullWidth
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            variant="outlined"
            className="main-text__field"
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="">{t("myprofile.common.noData")}</MenuItem>
          </Select>
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.class")} />
          <Select
            fullWidth
            value={classID}
            onChange={(e) => setClassID(e.target.value)}
            variant="outlined"
            className="main-text__field"
            MenuProps={{ disableScrollLock: true }}
            disabled
          >
            <MenuItem value="">{t("myprofile.common.noData")}</MenuItem>
          </Select>
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.citizenId")} required />
          <TextField
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.issueDate")} />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={issueDate ? new Date(issueDate) : null}
              onChange={(newValue) => setIssueDate(newValue ? newValue.toISOString() : "")}
              className="main-text__field"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.issuePlace")} required />
          <TextField
            value={issuePlace}
            onChange={(e) => setIssuePlace(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.insuranceNumber")} required />
          <TextField
            value={insuranceNumber}
            onChange={(e) => setInsuranceNumber(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.bankName")} required />
          <TextField
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.bankAccountNumber")} required />
          <TextField
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.exemptedGroup")} required />
          <TextField
            value={exemptedGroup}
            onChange={(e) => setExemptedGroup(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.fields.priorityGroup")} required />
          <TextField
            value={priorityGroup}
            onChange={(e) => setPriorityGroup(e.target.value)}
            fullWidth
            variant="outlined"
            className="main-text__field"
          />
        </Grid>

        <Grid size={12} className="myprofile-form__actions">
          <Button className="home-flex__button" onClick={handleSaveInformation} disabled={isSaving}>
            {isSaving ? t("myprofile.common.saving") : t("myprofile.common.saveInformation")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
