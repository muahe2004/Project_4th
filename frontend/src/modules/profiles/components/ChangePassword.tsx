import { Grid, TextField } from "@mui/material";

import LabelPrimary from "../../../components/Label/Label";
import Button from "../../../components/Button/Button";

export default function ChangePassword() {
  return (
    <Grid container spacing={2} className="myprofile-form">
      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value="Mật khẩu cũ" required />
        <TextField fullWidth variant="outlined" className="main-text__field" />
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value="Mật khẩu mới" required />
        <TextField fullWidth variant="outlined" className="main-text__field" />
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value="Xác nhận mật khẩu mới" required />
        <TextField fullWidth variant="outlined" className="main-text__field" />
      </Grid>

      <Grid size={4} className="myprofile-form__group">
        <LabelPrimary value="Mã xác nhận" required />
        <TextField fullWidth variant="outlined" className="main-text__field" />
      </Grid>

      <Grid size={12} className="myprofile-form__actions">
        <Button className="home-flex__button">Đổi mật khẩu</Button>
      </Grid>
    </Grid>
  );
}
