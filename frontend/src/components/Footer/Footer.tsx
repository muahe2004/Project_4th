import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Link } from '@mui/material';
import Grid from '@mui/material/Grid';
import './Footer.css';
import logo from '../../assets/images/logoUTEHY.png';
import { Facebook, GitHub, SportsBasketball, Twitter } from '@mui/icons-material';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <AppBar position="static" className="footer">
            <Toolbar className="footer-toolbar">
                <Grid className="footer-grid">
                    <Grid>
                        <Box className="footer-item__box">
                            <img src={logo} alt="Logo" className="footer-item__logo"/>
                        </Box>
                        <Box>
                            <IconButton className="footer-item__icon" href="#" color="inherit"><Twitter /></IconButton>
                            <IconButton className="footer-item__icon" href="#" color="inherit"><GitHub /></IconButton>
                            <IconButton className="footer-item__icon" href="#" color="inherit"><Facebook /></IconButton>
                            <IconButton className="footer-item__icon" href="#" color="inherit"><SportsBasketball /></IconButton> 
                        </Box>
                    </Grid>

                    <Grid>
                        <Typography className="footer-item__title" gutterBottom>{t('footer.unicores')}</Typography>
                        <Link className="footer-item__link" href="#" color="inherit" display="block">{t('footer.trainingProgram')}</Link>
                        <Link className="footer-item__link" href="#" color="inherit" display="block">{t('footer.admission')}</Link>
                        <Link className="footer-item__link" href="#" color="inherit" display="block">{t('footer.scholarship')}</Link>
                        <Link className="footer-item__link" href="#" color="inherit" display="block">{t('footer.registration')}</Link>
                        <Link className="footer-item__link" href="#" color="inherit" display="block">{t('footer.onlineLearning')}</Link>
                    </Grid>

                    <Grid>
                        <Typography className="footer-item__title" gutterBottom>{t('footer.contactUs')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.contact.branch1Phone')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.contact.branch2Phone')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.contact.branch3Phone')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.contact.email')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.contact.website')}</Typography>
                    </Grid>

                    <Grid>
                        <Typography className="footer-item__title" gutterBottom>{t('footer.address')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.addresses.branch1Adress')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.addresses.branch2Adress')}</Typography>
                        <Typography className="footer-item__text" display="block" gutterBottom>{t('footer.addresses.branch3Adress')}</Typography>
                    </Grid>
                </Grid>
            </Toolbar>

            <Toolbar className="footer-toolbar footer-toolbar__second">
                <Typography className="footer-toolbar__typography" gutterBottom>{t('footer.copyright')}</Typography>
                <LanguageSwitcher />
            </Toolbar>
        </AppBar>
    );
};

export default Footer;
