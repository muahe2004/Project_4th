import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Grid, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import LabelPrimary from "../../../components/Label/Label";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ROLES } from "../../../constants/roles";
import { useGetCurrentUserRelatives, type RelativeResponse } from "../apis/getRelatives";
import { useGetTeacherProfile, useGetStudentProfile } from "../apis/getProfile";
import { useUpdateStudentProfile, useUpdateTeacherProfile } from "../apis/updateProfile";

type RelativeFormState = {
  name: string;
  date_of_birth: string;
  nationality: string;
  ethnicity: string;
  religion: string;
  phone: string;
  address: string;
  occupation: string;
};

const emptyRelative = (): RelativeFormState => ({
  name: "",
  date_of_birth: "",
  nationality: "",
  ethnicity: "",
  religion: "",
  phone: "",
  address: "",
  occupation: "",
});

function normalizeRelationship(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function toFormState(relative?: RelativeResponse): RelativeFormState {
  if (!relative) {
    return emptyRelative();
  }

  return {
    name: relative.name ?? "",
    date_of_birth: relative.date_of_birth ?? "",
    nationality: relative.nationality ?? "",
    ethnicity: relative.ethnicity ?? "",
    religion: relative.religion ?? "",
    phone: relative.phone ?? "",
    address: relative.address ?? "",
    occupation: relative.occupation ?? "",
  };
}

function RelativeSection({
  title,
  state,
  setState,
}: {
  title: string;
  state: RelativeFormState;
  setState: Dispatch<SetStateAction<RelativeFormState>>;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Grid size={12}>
        <Typography className="myprofile-panel__title">{title}</Typography>
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.name")} required />
        <TextField
          fullWidth
          variant="outlined"
          className="main-text__field"
          value={state.name}
          onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
        />
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.birthYear")} />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={state.date_of_birth ? new Date(state.date_of_birth) : null}
            onChange={(value) =>
              setState((prev) => ({
                ...prev,
                date_of_birth: value ? value.toISOString() : "",
              }))
            }
            className="main-text__field"
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.nationality")} required />
        <TextField
          fullWidth
          variant="outlined"
          className="main-text__field"
          value={state.nationality}
          onChange={(e) => setState((prev) => ({ ...prev, nationality: e.target.value }))}
        />
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.ethnicity")} required />
        <TextField
          fullWidth
          variant="outlined"
          className="main-text__field"
          value={state.ethnicity}
          onChange={(e) => setState((prev) => ({ ...prev, ethnicity: e.target.value }))}
        />
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.religion")} required />
        <TextField
          fullWidth
          variant="outlined"
          className="main-text__field"
          value={state.religion}
          onChange={(e) => setState((prev) => ({ ...prev, religion: e.target.value }))}
        />
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.phone")} required />
        <TextField
          fullWidth
          variant="outlined"
          className="main-text__field"
          value={state.phone}
          onChange={(e) => setState((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </Grid>

      <Grid size={6} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.address")} required />
        <TextField
          fullWidth
          variant="outlined"
          className="main-text__field"
          value={state.address}
          onChange={(e) => setState((prev) => ({ ...prev, address: e.target.value }))}
        />
      </Grid>

      <Grid size={6} className="myprofile-form__group">
        <LabelPrimary value={t("myprofile.relative.occupation")} required />
        <TextField
          fullWidth
          variant="outlined"
          className="main-text__field"
          value={state.occupation}
          onChange={(e) => setState((prev) => ({ ...prev, occupation: e.target.value }))}
        />
      </Grid>
    </>
  );
}

export default function Relatives() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { showSnackbar } = useSnackbar();
  const isTeacher = user?.role === ROLES.TEACHER;
  const isStudent = user?.role === ROLES.STUDENT;

  const { data: relatives, isLoading } = useGetCurrentUserRelatives();
  const { data: teacherProfile } = useGetTeacherProfile(user?.id, isTeacher);
  const { data: studentProfile } = useGetStudentProfile(user?.id, isStudent);
  const updateTeacherProfile = useUpdateTeacherProfile();
  const updateStudentProfile = useUpdateStudentProfile();

  const [father, setFather] = useState<RelativeFormState>(emptyRelative);
  const [mother, setMother] = useState<RelativeFormState>(emptyRelative);
  const [spouse, setSpouse] = useState<RelativeFormState>(emptyRelative);

  const relativeBuckets = useMemo(() => {
    const bucket = {
      father: undefined as RelativeResponse | undefined,
      mother: undefined as RelativeResponse | undefined,
      spouse: undefined as RelativeResponse | undefined,
    };

    (relatives ?? []).forEach((relative) => {
      const relationship = normalizeRelationship(relative.relationship);
      if (
        relationship.includes("bố") ||
        relationship.includes("cha") ||
        relationship.includes("father")
      ) {
        bucket.father = relative;
      } else if (
        relationship.includes("mẹ") ||
        relationship.includes("mother")
      ) {
        bucket.mother = relative;
      } else if (
        relationship.includes("vợ") ||
        relationship.includes("chồng") ||
        relationship.includes("spouse") ||
        relationship.includes("wife") ||
        relationship.includes("husband")
      ) {
        bucket.spouse = relative;
      }
    });

    return bucket;
  }, [relatives]);

  useEffect(() => {
    setFather(toFormState(relativeBuckets.father));
    setMother(toFormState(relativeBuckets.mother));
    setSpouse(toFormState(relativeBuckets.spouse));
  }, [relativeBuckets]);

  const handleSaveRelatives = async () => {
    const tasks: Promise<unknown>[] = [];

    const buildRelative = (state: RelativeFormState, relationship: string) => {
      const hasValue = Object.values(state).some((value) => value.trim() !== "");
      if (!hasValue) {
        return null;
      }

      return {
        name: state.name.trim(),
        date_of_birth: state.date_of_birth || null,
        nationality: state.nationality.trim() || null,
        ethnicity: state.ethnicity.trim() || null,
        religion: state.religion.trim() || null,
        occupation: state.occupation.trim() || null,
        phone: state.phone.trim() || null,
        address: state.address.trim() || null,
        relationship,
      };
    };

    const payload = [buildRelative(father, "Bố"), buildRelative(mother, "Mẹ"), buildRelative(spouse, "Vợ/Chồng")].filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    if (isTeacher && teacherProfile?.id) {
      tasks.push(
        updateTeacherProfile.mutateAsync({
          id: teacherProfile.id,
          data: {
            teacher_relatives: payload,
          },
        })
      );
    }

    if (isStudent && studentProfile?.id) {
      tasks.push(
        updateStudentProfile.mutateAsync({
          id: studentProfile.id,
          data: {
            student_relatives: payload,
          },
        })
      );
    }

    try {
      await Promise.all(tasks);
      showSnackbar(t("myprofile.messages.updateRelativesSuccess"), "success");
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
    <Grid container spacing={2} className="myprofile-form">
      <RelativeSection title={t("myprofile.relativeSections.father")} state={father} setState={setFather} />
      <RelativeSection title={t("myprofile.relativeSections.mother")} state={mother} setState={setMother} />
      <RelativeSection
        title={t("myprofile.relativeSections.spouse")}
        state={spouse}
        setState={setSpouse}
      />

      <Grid size={12} className="myprofile-form__actions">
        <Button
          className="home-flex__button"
          onClick={handleSaveRelatives}
          disabled={updateTeacherProfile.isPending || updateStudentProfile.isPending}
        >
          {updateTeacherProfile.isPending || updateStudentProfile.isPending
            ? t("myprofile.common.saving")
            : t("myprofile.common.saveInformation")}
        </Button>
      </Grid>
    </Grid>
  );
}
