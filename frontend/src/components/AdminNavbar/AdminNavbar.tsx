import * as React from "react";
import AppBar from "@mui/material/AppBar";
import { useNavigate } from "react-router-dom";

import "./AdminNavbar.css";
import { ChevronLeft, ChevronRight, Home, People, Settings } from "@mui/icons-material";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";

const pages = [
  { label: "Home", path: "/" },
  { label: "Profile", path: "/profile" },
  { label: "Grades", path: "/grades" },
  { label: "Schedule", path: "/schedule" },
];

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