import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'vi');

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <Box
      
      className="switcher-group"
    >
      <button
        onClick={() => handleChangeLanguage('vi')}
        color={language === 'vi' ? 'primary' : 'inherit'}
        className={`switcher-group__button ${language === 'vi' ? 'focus' : ''}`}
      >
        VI
      </button>
      <button
        onClick={() => handleChangeLanguage('en')}
        color={language === 'en' ? 'primary' : 'inherit'}
        className={`switcher-group__button ${language === 'en' ? 'focus' : ''}`}
      >
        EN
      </button>
    </Box>
  );
};

export default LanguageSwitcher;
