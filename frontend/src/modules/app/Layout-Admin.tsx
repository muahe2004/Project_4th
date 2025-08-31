import { Outlet } from "react-router-dom";
import "./styles/index.css"; 
import AdminHeader from "../../components/Header/AdminHeader";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar"
import { useAuthStore } from "../../stores/useAuthStore"

export default function LayoutAdmin() {
  return (
    <div>
        <AdminHeader></AdminHeader>
        <AdminNavbar></AdminNavbar>

        <main className="main-layout">
            <Outlet />
        </main>
    </div>
  );
}
