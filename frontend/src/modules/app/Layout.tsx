import { Outlet } from "react-router-dom";
import "./styles/index.css"; 
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function Layout() {
  return (
    <div style={{background: "", height: "1000px"}}>
      
      <Header></Header>

      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>

      <Footer></Footer>
    </div>
  );
}
