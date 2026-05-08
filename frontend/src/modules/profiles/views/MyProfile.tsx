import { Box, Tabs, Tab } from "@mui/material";
import "./styles/MyProfile.css";
import { useState, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

import Information from "../components/Information";
import Relatives from "../components/Relatives";
import ChangePassword from "../components/ChangePassword";

export function MyProfile() {
  const { t } = useTranslation();
  const [value, setValue] = useState<number>(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box className="myprofile">
      <h1 className="primary-title">{t("myprofile.title")}</h1>

      <Tabs className="myprofile-tabs" value={value} onChange={handleChange}>
        <Tab classes={{ selected: "active-tab" }} label="Thông tin cá nhân" />
        <Tab classes={{ selected: "active-tab" }} label="Thông tin người thân" />
        <Tab classes={{ selected: "active-tab" }} label="Đổi mật khẩu" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {value === 0 ? <Information /> : null}
        {value === 1 ? <Relatives /> : null}
        {value === 2 ? <ChangePassword /> : null}
      </Box>
    </Box>
  );
}

export default MyProfile;
