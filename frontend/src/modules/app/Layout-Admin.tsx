import { Outlet } from "react-router-dom";
import "./styles/index.css"; 
import Header from "../../components/Header/Header";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar"
import { useAuthStore } from "../../stores/useAuthStore"

export default function LayoutAdmin() {
  return (
    <div>
        <Header></Header>
        <AdminNavbar></AdminNavbar>

        <main className="main-layout">
            <Outlet />
        </main>
    </div>
  );
}
