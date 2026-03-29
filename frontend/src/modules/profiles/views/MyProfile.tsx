import { Box, Tabs, Tab } from "@mui/material";
import "./styles/MyProfile.css";
import { useState, type ReactNode, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

import Information from "../components/Information";
import Relatives from "../components/Relatives";
import ChangePassword from "../components/ChangePassword";

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

      <TabPanel value={value} index={0}>
        <Information />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Relatives />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <ChangePassword />
      </TabPanel>
    </Box>
  );
}

export default MyProfile;
