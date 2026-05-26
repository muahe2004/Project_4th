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
  Typography,
  Drawer,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from "../../stores/useAuthStore";
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import {
  homeUrl,
  profileUrl,
  signinUrl,
  gradesUrl,
  studentTuitionFeesUrl,
  teacherManagementScoreUrl,
  studentLearningSchedules,
  studentExaminationSchedules,
  teacherTeachingSchedules,
  aboutUrl,
  admissionUrl,
  teacherExaminationSchedules,
  courseRegistrationUrl,
  newsAndEventsUrl,
} from "../../routes/urls"
import logo from '../../assets/images/logoUTEHY.png';
import "./Header.css"
import { ROLES } from '../../constants/roles';
import UMSChatBot from '../../modules/umsChatbot/views/UMSChatBot';
import { MEDIA_QUERY } from '../../constants/breakpoints';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout); 
  const isTeacher = user?.role === ROLES.TEACHER;
  const isStudent = user?.role === ROLES.STUDENT;
  const scheduleUrl = isTeacher ? teacherTeachingSchedules : studentLearningSchedules;
  const learningScheduleLabel = isTeacher
    ? t('header_menu.teachingSchedule')
    : t('header_menu.learningSchedule');
  const examScheduleLabel = isTeacher
    ? t('header_menu.proctoringSchedule')
    : t('header_menu.examSchedule');

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [openChatBot, setOpenChatBot] = useState(false);
  const isTabletAndDown = useMediaQuery(MEDIA_QUERY.tabletAndDown);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleNavigate = (url: string) => {
    navigate(url);
    handleCloseUserMenu();
    setOpenMobileMenu(false);
  };

  const handleAcademicResultNavigate = () => {
    handleNavigate(isTeacher ? teacherManagementScoreUrl : gradesUrl);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logout();            
    handleCloseUserMenu();     
    navigate(signinUrl);     
  };
  const isHomeActive = location.pathname === homeUrl;

  return (
    <AppBar position="static" className="header">
      <Toolbar className="header-toolbar">
        {isTabletAndDown && (
          <IconButton
            color="inherit"
            onClick={() => setOpenMobileMenu(true)}
            aria-label="Open navigation menu"
            className="header-mobile-toggle"
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box onClick={() => handleNavigate(homeUrl)} className={`header-flex ${isTabletAndDown ? "header-brand--hidden-mobile" : ""}`}>
          <img src={logo} alt="Logo" className="header-logo"/>
          <Typography variant="h1" className="header-title">UniCore</Typography>
        </Box>

        <Stack className="header-navbar" direction="row">
          <Button
            className={`header-navbar__item ${isHomeActive ? "header-navbar__item--active" : ""}`}
            disableRipple
            color="inherit"
            onClick={() => handleNavigate(homeUrl)}
          >
            {t('header_navbar.home')}
          </Button>
          {/* <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.trainingProgram')}</Button> */}
          <Button
            className="header-navbar__item"
            disableRipple
            color="inherit"
            onClick={() => handleNavigate(admissionUrl)}
          >
            {t('header_navbar.admission')}
          </Button>
          <Button
            className="header-navbar__item"
            disableRipple
            color="inherit"
            onClick={() => handleNavigate(aboutUrl)}
          >
            {t('header_navbar.aboutUTEHY')}
          </Button>
          <Button
            className="header-navbar__item"
            disableRipple
            color="inherit"
            onClick={() => handleNavigate(newsAndEventsUrl)}
          >
            {t('header_navbar.newsEvents')}
          </Button>
          {/* <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.scholarship')}</Button> */}
          {/* <Button className="header-navbar__item" disableRipple color="inherit">{t('header_navbar.onlineLearning')}</Button> */}
        </Stack>

        <Box className="header-flex">
          <IconButton
            className="header-navbar__item"
            color="inherit"
            onClick={() => setOpenChatBot(true)}
            aria-label="Open AI chat"
          >
            <SmartToyOutlinedIcon />
          </IconButton>
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
            <MenuItem onClick={handleAcademicResultNavigate}>{t('header_menu.academicResults')}</MenuItem>
            <MenuItem onClick={() => handleNavigate(scheduleUrl)}>
              {learningScheduleLabel}
            </MenuItem>
            <MenuItem onClick={() => handleNavigate(isTeacher ? teacherExaminationSchedules : studentExaminationSchedules)}>
              {examScheduleLabel}
            </MenuItem>
            {isStudent && (
              <MenuItem onClick={() => handleNavigate(courseRegistrationUrl)}>
                {t('header_navbar.register')}
              </MenuItem>
            )}
            {!isTeacher && (
              <MenuItem onClick={() => handleNavigate(studentTuitionFeesUrl)}>
                {t('header_menu.tuition')}
              </MenuItem>
            )}
            <MenuItem 
              onClick={handleLogout}
            >{t('header_menu.logout')}</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <Drawer
        anchor="left"
        open={openMobileMenu}
        onClose={() => setOpenMobileMenu(false)}
      >
        <Box className="header-mobile-menu" role="presentation">
          <Box className="header-mobile-menu__brand" onClick={() => handleNavigate(homeUrl)}>
            <img src={logo} alt="Logo" className="header-logo"/>
            <Typography variant="h1" className="header-title">UniCore</Typography>
          </Box>
          <Button className="header-mobile-menu__item" onClick={() => handleNavigate(homeUrl)}>{t('header_navbar.home')}</Button>
          <Button className="header-mobile-menu__item" onClick={() => handleNavigate(admissionUrl)}>{t('header_navbar.admission')}</Button>
          <Button className="header-mobile-menu__item" onClick={() => handleNavigate(aboutUrl)}>{t('header_navbar.aboutUTEHY')}</Button>
          <Button className="header-mobile-menu__item" onClick={() => handleNavigate(newsAndEventsUrl)}>{t('header_navbar.newsEvents')}</Button>
        </Box>
      </Drawer>
      <UMSChatBot
        open={openChatBot}
        onClose={() => setOpenChatBot(false)}
      />
    </AppBar>
  );
};

export default Header;
