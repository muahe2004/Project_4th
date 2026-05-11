import * as React from "react";
import AppBar from "@mui/material/AppBar";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import AssignmentIcon from "@mui/icons-material/Assignment"; 
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { Home, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useTranslation } from "react-i18next";

import "./AdminNavbar.css";
import { classesUrl, dashBoardUrl, departmentUrl, examinationScheduleUrl, majorUrl, managementScoreUrl, roomUrl, specializationsUrl, studentUrl, subjectUrl, teacherUrl, teachingScheduleUrl, trainingProgramUrl, tuitionFeeUrl } from "../../routes/urls";

type NavbarProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ isOpen, setIsOpen }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const menuItems = [
    { label: t("adminNavbar.home"), icon: <Home />, path: `${dashBoardUrl}` },
    { label: t("adminNavbar.department"), icon: <SchoolIcon />, path: `${dashBoardUrl}/${departmentUrl}` },
    { label: t("adminNavbar.major"), icon: <MenuBookIcon />, path: `${dashBoardUrl}/${majorUrl}` },
    { label: t("adminNavbar.specialization"), icon: <AccountTreeIcon />, path: `${dashBoardUrl}/${specializationsUrl}` },
    { label: t("adminNavbar.subject"), icon: <AutoStoriesIcon />, path: `${dashBoardUrl}/${subjectUrl}` },
    { label: t("adminNavbar.teachingSchedule"), icon: <EditCalendarIcon />, path: `${dashBoardUrl}/${teachingScheduleUrl}` },
    { label: t("adminNavbar.examinationSchedule"), icon: <AssignmentIcon />, path: `${dashBoardUrl}/${examinationScheduleUrl}` },
    { label: t("adminNavbar.student"), icon: <GroupsIcon />, path: `${dashBoardUrl}/${studentUrl}` },
    { label: t("adminNavbar.teacher"), icon: <PersonIcon />, path: `${dashBoardUrl}/${teacherUrl}` },
    { label: t("adminNavbar.class"), icon: <ClassIcon />, path: `${dashBoardUrl}/${classesUrl}` },
    { label: t("adminNavbar.room"), icon: <MeetingRoomIcon />, path: `${dashBoardUrl}/${roomUrl}` },
    { label: t("adminNavbar.trainingProgram"), icon: <WorkspacePremiumIcon />, path: `${dashBoardUrl}/${trainingProgramUrl}` },
    { label: t("adminNavbar.tuitionFee"), icon: <RequestQuoteIcon />, path: `${dashBoardUrl}/${tuitionFeeUrl}` },
    { label: t("adminNavbar.studentScore"), icon: <LeaderboardIcon />, path: `${dashBoardUrl}/${managementScoreUrl}` },

  ];

  return (
    <AppBar className={`admin-navbar ${isOpen ? "open" : "closed"}`}>
      <List className="admin-navbar__list">
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            className={`admin-navbar__button ${isOpen ? "open" : "closed"} ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon
              className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              className={`admin-navbar__text ${isOpen ? "open" : "closed"}`}
              primary={item.label}
            />
          </ListItemButton>
        ))}
      </List>

      <button onClick={handleToggle} className="admin-navbar__toggle--button">
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>
    </AppBar>
  );
}
