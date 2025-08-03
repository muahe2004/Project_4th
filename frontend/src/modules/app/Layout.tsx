import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      {/* ✅ Header đơn giản */}
      <header style={{ backgroundColor: "#ccc", padding: "16px" }}>
        <h1 style={{ margin: 0 }}>🌐 My App Header</h1>
      </header>

      {/* ✅ Nội dung các route con */}
      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
