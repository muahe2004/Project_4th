import * as React from "react";
import AppBar from "@mui/material/AppBar";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import EventIcon from "@mui/icons-material/Event";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import AssignmentIcon from "@mui/icons-material/Assignment"; 
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { Home, People, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";

import "./AdminNavbar.css";

export default function Navbar() {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <AppBar className={`admin-navbar ${isOpen ? "open" : "closed"}`}>
            <List className="admin-navbar__list">
                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`} >
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <Home />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Trang chủ" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <SchoolIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Khoa" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <MenuBookIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Ngành" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <AccountTreeIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Chuyên ngành" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <AutoStoriesIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Môn học" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <EventIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Lịch học" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <EditCalendarIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Lịch dạy" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Lịch thi" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <GroupsIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Sinh viên" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Giảng viên" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <ClassIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Lớp" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <MeetingRoomIcon />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Phòng học" />
                </ListItemButton>

                <ListItemButton className={`admin-navbar__button ${isOpen ? "open" : "closed"}`}>
                    <ListItemIcon className={`admin-navbar__icon ${isOpen ? "open" : "closed"}`}>
                        <People />
                    </ListItemIcon>
                    <ListItemText className={`admin-navbar__text ${isOpen ? "open" : "closed"}`} primary="Người dùng" />
                </ListItemButton>
            </List>

            <button onClick={handleToggle} className="admin-navbar__toggle--button">
                {isOpen ? <ChevronLeft /> : <ChevronRight />}    
            </button>
        </AppBar>
    );
}