import { Outlet } from "react-router-dom";
import "./styles/index.css"; 
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function Layout() {
  return (
    <div>
      <Header></Header>

      <main className="main-layout">
        <Outlet />
      </main>

      <Footer></Footer>
    </div>
  );
}
