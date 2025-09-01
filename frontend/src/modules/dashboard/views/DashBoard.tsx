import { useTranslation } from 'react-i18next';

export function DashBoard() {
    const { t } = useTranslation();
  
    return (
        <main className="DashBoard">
            <p style={{ background: "red", height: "300px", width: "500px"}}>Trang dasboard</p>
        </main>
    );
}

export default DashBoard;
