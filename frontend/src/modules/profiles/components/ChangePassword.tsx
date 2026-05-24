import { useTranslation } from "react-i18next";

export default function ChangePassword() {
  const { t } = useTranslation();
  return (
    <>
      {/*
      <Grid container spacing={2} className="myprofile-form">
        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.password.oldPassword")} />
          <TextField fullWidth variant="outlined" className="main-text__field" />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.password.newPassword")} />
          <TextField fullWidth variant="outlined" className="main-text__field" />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.password.confirmPassword")} />
          <TextField fullWidth variant="outlined" className="main-text__field" />
        </Grid>

        <Grid size={4} className="myprofile-form__group">
          <LabelPrimary value={t("myprofile.password.verificationCode")} />
          <TextField fullWidth variant="outlined" className="main-text__field" />
        </Grid>

        <Grid size={12} className="myprofile-form__actions">
          <Button className="home-flex__button">{t("myprofile.password.changeButton")}</Button>
        </Grid>
      </Grid>
      */}
    </>
  );
}
