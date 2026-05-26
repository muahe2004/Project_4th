import { Outlet } from "react-router-dom";
import "./styles/index.css"; 
import AdminHeader from "../../components/Header/AdminHeader";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar"
import { useState } from "react";
import { useMediaQuery } from "@mui/material";
import { MEDIA_QUERY } from "../../constants/breakpoints";

export default function LayoutAdmin() {
  const [isOpenNavbar, setIsOpenNavbar] = useState(true);
  const isTabletOrMobile = useMediaQuery(MEDIA_QUERY.tabletAndDown);

  if (isTabletOrMobile) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "16px",
        }}
      >
        <p>Vui lòng truy cập bằng máy tính hoặc laptop.</p>
        <p>Please access this page using a desktop or laptop.</p>
      </div>
    );
  }

  return (
    <div>
        <AdminHeader></AdminHeader>
        <AdminNavbar isOpen={isOpenNavbar} setIsOpen={setIsOpenNavbar}></AdminNavbar>

        <main className={`main-layout-admin ${isOpenNavbar ? "openNav" : "closedNav" }`}>
            <Outlet />
        </main>
    </div>
  );
}
