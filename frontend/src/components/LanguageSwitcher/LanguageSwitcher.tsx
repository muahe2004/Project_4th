import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import "./LanguageSwitcher.css";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
    const { i18n } = useTranslation();

    const currentLang = i18n.language;

    const handleChangeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <Box
            className="switcher-group"
        >
        <button
            onClick={() => handleChangeLanguage('vi')}
            color={currentLang === 'vi' ? 'primary' : 'inherit'}
            className={`switcher-group__button ${currentLang === 'vi' ? 'focus' : ''} ${className}`}
        >
            VI
        </button>
        <button
            onClick={() => handleChangeLanguage('en')}
            color={currentLang === 'en' ? 'primary' : 'inherit'}
            className={`switcher-group__button ${currentLang === 'en' ? 'focus' : ''} ${className}`}
        >
            EN
        </button>
        </Box>
    );
};

export default LanguageSwitcher;
