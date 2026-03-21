import React, { type MouseEvent, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "../../stores/useAuthStore";
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { homeUrl, profileUrl, signinUrl, gradesUrl, studentLearningSchedules } from "../../routes/urls"
import logo from '../../assets/images/logoUTEHY.png';
import "./Header.css"

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout); 

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleNavigate = (url: string) => {
    navigate(url);
    handleCloseUserMenu();
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logout();            
    handleCloseUserMenu();     
    navigate(signinUrl);     
  };

  return (
    <AppBar position="static" className="header">
      <Toolbar className="header-toolbar">
        <Box onClick={() => handleNavigate(homeUrl)} className="header-flex">
          <img src={logo} alt="Logo" className="header-logo"/>
          <Typography variant="h1" className="header-title">UniCore</Typography>
        </Box>

        <Stack className="header-navbar" direction="row">
          <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.home')}</Button>
          <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.trainingProgram')}</Button>
          <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.admission')}</Button>
          <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.scholarship')}</Button>
          <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.register')}</Button>
          <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.onlineLearning')}</Button>
        </Stack>

        <Box className="header-flex">
          <LanguageSwitcher />

          <IconButton onClick={handleOpenUserMenu}>
            <Avatar alt="User Avatar" src="" className="header-avatar"/>
          </IconButton>
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            disableScrollLock={true} 
          >
            <MenuItem 
              onClick={() => handleNavigate(profileUrl)}
            >{t('header_menu.profile')}</MenuItem>
            <MenuItem onClick={() => handleNavigate(gradesUrl)}>{t('header_menu.academicResults')}</MenuItem>
            <MenuItem onClick={() => handleNavigate(studentLearningSchedules)}>{t('header_menu.learningSchedule')}</MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>{t('header_menu.examSchedule')}</MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>{t('header_menu.tuition')}</MenuItem>
            <MenuItem 
              onClick={handleLogout}
            >{t('header_menu.logout')}</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
