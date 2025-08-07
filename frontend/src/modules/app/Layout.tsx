import { Outlet } from "react-router-dom";
import "./styles/index.css"; 
import Header from "../../components/Header/Header";

export default function Layout() {
  return (
    <div style={{background: "", height: "100vh"}}>
      
      <Header></Header>

      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
