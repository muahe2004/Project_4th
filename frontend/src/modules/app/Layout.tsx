import { Outlet } from "react-router-dom";
import "./styles/index.css"; 

export default function Layout() {
  return (
    <div style={{background: "#CDA666", height: "100vh"}}>
      <header style={{ backgroundColor: "#343D60", padding: "16px", color: "#fff" }}>
        <h1 style={{ margin: 0 }}>🌐 My App Header</h1>
      </header>

      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
