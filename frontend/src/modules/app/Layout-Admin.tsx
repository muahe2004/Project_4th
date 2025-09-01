import { Outlet } from "react-router-dom";
import "./styles/index.css"; 
import AdminHeader from "../../components/Header/AdminHeader";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar"
import { useAuthStore } from "../../stores/useAuthStore"
import { useState } from "react";

export default function LayoutAdmin() {
  const [isOpenNavbar, setIsOpenNavbar] = useState(true);
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
