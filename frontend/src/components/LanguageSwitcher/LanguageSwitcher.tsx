import { Box, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

import VietNam from "../../assets/images/VietNam.png";
import UK from "../../assets/images/united-kingdom.png";
interface LanguageSwitcherProps {
    className?: string;
}

const languages = [
    { code: 'vi', flag: VietNam, label: 'Tiếng Việt' },
    { code: 'en', flag: UK, label: 'English' },
];

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const handleChangeLanguage = (event: SelectChangeEvent) => {
        const selectedLang = event.target.value;
        i18n.changeLanguage(selectedLang);
    };

    return (
        <Box className={`switcher-dropdown ${className}`}>
            <Select
                variant="filled"
                value={currentLang}
                onChange={handleChangeLanguage}
                className="switcher-select"
                MenuProps={{
                    disableScrollLock: true,
                }}
                renderValue={(value) => {
                    const lang = languages.find(l => l.code === value);
                    return (
                        <img
                            className="switcher-image"
                            src={lang?.flag}
                            alt={lang?.code}
                        />
                    );
                }}
            >
                {languages.map((lang) => (
                    <MenuItem
                        className="switcher-menu"
                        key={lang.code}
                        value={lang.code}
                    >
                        <img
                            className="switcher-image"
                            src={lang.flag}
                            alt={lang.code}
                        />
                        <span className='switcher-label'>{lang.label}</span>
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default LanguageSwitcher;
