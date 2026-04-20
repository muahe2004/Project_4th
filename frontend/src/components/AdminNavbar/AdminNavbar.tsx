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
import { Home, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

import "./AdminNavbar.css";
import { classesUrl, dashBoardUrl, departmentUrl, examinationScheduleUrl, majorUrl, roomUrl, specializationsUrl, studentUrl, subjectUrl, teacherUrl, teachingScheduleUrl, trainingProgramUrl, tuitionFeeUrl } from "../../routes/urls";

type NavbarProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ isOpen, setIsOpen }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const menuItems = [
    { label: "Trang chủ", icon: <Home />, path: `${dashBoardUrl}` },
    { label: "Khoa", icon: <SchoolIcon />, path: `${dashBoardUrl}/${departmentUrl}` },
    { label: "Ngành", icon: <MenuBookIcon />, path: `${dashBoardUrl}/${majorUrl}` },
    { label: "Chuyên ngành", icon: <AccountTreeIcon />, path: `${dashBoardUrl}/${specializationsUrl}` },
    { label: "Môn học", icon: <AutoStoriesIcon />, path: `${dashBoardUrl}/${subjectUrl}` },
    // { label: "Lịch học", icon: <EventIcon />, path: `${dashBoardUrl}/${learningScheduleUrl}` },
    { label: "Lịch dạy", icon: <EditCalendarIcon />, path: `${dashBoardUrl}/${teachingScheduleUrl}` },
    { label: "Lịch thi", icon: <AssignmentIcon />, path: `${dashBoardUrl}/${examinationScheduleUrl}` },
    { label: "Sinh viên", icon: <GroupsIcon />, path: `${dashBoardUrl}/${studentUrl}` },
    { label: "Giảng viên", icon: <PersonIcon />, path: `${dashBoardUrl}/${teacherUrl}` },
    { label: "Lớp", icon: <ClassIcon />, path: `${dashBoardUrl}/${classesUrl}` },
    { label: "Phòng học", icon: <MeetingRoomIcon />, path: `${dashBoardUrl}/${roomUrl}` },
    { label: "Chương trình", icon: <MeetingRoomIcon />, path: `${dashBoardUrl}/${trainingProgramUrl}` },
    { label: "Học phí", icon: <MeetingRoomIcon />, path: `${dashBoardUrl}/${tuitionFeeUrl}` },
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
