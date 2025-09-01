import { useTranslation } from 'react-i18next';

import "./styles/DashBoard.css";
import { Typography } from '@mui/material';
import { useAuthStore } from '../../../stores/useAuthStore';

export function DashBoard() {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user); 

    return (
        <main className="dash-board">
            <Typography className='dash-board__welcome'> {user ? `Hi ${user?.name}` : "Loading..."} </Typography>
        </main>
    );
}

export default DashBoard;
