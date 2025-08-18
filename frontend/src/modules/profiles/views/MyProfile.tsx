import { Box, MenuItem, Select, Tabs, Tab, TextField, Typography, Grid } from "@mui/material";
import "./styles/MyProfile.css"
import { useTranslation } from "react-i18next";
import LabelPrimary from "../../../components/Label/Label"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import defaultUser from "../../../assets/images/default-user.png"
import { useState, type ReactNode } from "react";
import Button from "../../../components/Button/Button";

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

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box className="myprofile">
            <Typography className="myprofile-title">
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
                                Ly Van Minh - 10122256
                            </Typography>
                            <Typography className="myprofile-email">
                                lyvanminh280504@gmail.com
                            </Typography>
                        </div>
                    </div>
                </div>

                <Grid container spacing={2} className="myprofile-form">
                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch"></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>                    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc"></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>

                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Sinh nhật"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="myprofile-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Giới tính"></LabelPrimary>
                        <Select
                            fullWidth
                            id="outlined-select"
                            variant="outlined"
                            className="myprofile-text__field"
                            defaultValue=""
                        >
                            <MenuItem value="option1">Male</MenuItem>
                            <MenuItem value="option2">Famale</MenuItem>
                            <MenuItem value="option3">Other</MenuItem>
                        </Select>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Email"></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={6} className="myprofile-form__group myprofile-form__group--fullwidth">
                        <LabelPrimary value="Địa chỉ"></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Quê quán"></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Chương trình đào tạo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Niên khoá" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Học vị"></LabelPrimary>
                        <Select
                            fullWidth
                            id="outlined-select"
                            variant="outlined"
                            className="myprofile-text__field"
                            defaultValue=""
                        >
                            <MenuItem value="option1">Cử nhân</MenuItem>
                            <MenuItem value="option2">Thạc sĩ</MenuItem>
                            <MenuItem value="option3">Tiến sĩ</MenuItem>
                        </Select>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Khoa"></LabelPrimary>
                        <Select
                            fullWidth
                            id="outlined-select"
                            variant="outlined"
                            className="myprofile-text__field"
                            defaultValue=""
                        >
                            <MenuItem value="option1">CNTT</MenuItem>
                            <MenuItem value="option2">KT</MenuItem>
                            <MenuItem value="option3">Other</MenuItem>
                        </Select>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số CCCD" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Ngày cấp"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="myprofile-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Nơi cấp" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số BHXH" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tên ngân hàng" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số tài khoản" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Đối tượng miễn giảm" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid> 

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Đối tượng ưu tiên" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
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
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Năm sinh"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="myprofile-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>  

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Địa chỉ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>   

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Nghề nghiệp cha" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>   

                    {/* Mẹ */}
                    <Grid size={12}>
                        <Typography className="myprofile-panel__title">
                            THÔNG TIN CỦA MẸ
                        </Typography>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Họ và tên mẹ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Năm sinh"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="myprofile-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>  

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Địa chỉ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>   

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Nghề nghiệp mẹ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>

                    {/* Vợ hoặc chồng */}
                    <Grid size={12}>
                        <Typography className="myprofile-panel__title">
                            THÔNG TIN CỦA VỢ/CHỒNG
                        </Typography>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Họ và tên vợ/chồng" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Năm sinh"></LabelPrimary>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                className="myprofile-text__field"
                                slotProps={{ 
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Quốc tịch" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Dân tộc" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Tôn giáo" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>  

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số điện thoại" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Địa chỉ" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>   

                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Nghề nghiệp vợ/chồng" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
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
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Mật khẩu mới" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Xác nhận mật khẩu mới" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
                    </Grid>    

                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Mã xác nhận" required></LabelPrimary>
                        <TextField fullWidth id="outlined-basic" variant="outlined" className="myprofile-text__field"/>
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