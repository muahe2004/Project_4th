import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Link } from '@mui/material';
import Grid from '@mui/material/Grid';
import './Footer.css';
import logo from '../../assets/images/logoUTEHY.png';
import { Facebook, GitHub, SportsBasketball, Twitter } from '@mui/icons-material';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';


const Footer: React.FC = () => {
  return (
    <AppBar position="static" className="footer">
        <Toolbar className="footer-toolbar">
            <img src={logo} alt="Logo" className="header-logo"/>
        </Toolbar>

        <Toolbar className="footer-toolbar">
            <Grid className="footer-grid">
                <Grid>
                    <Typography className="footer-item__title" gutterBottom>ABOUT</Typography>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">About</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Submit an issue</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">GitHub Repo</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Slack</Link>
                </Grid>

                <Grid>
                    <Typography className="footer-item__title" gutterBottom>GETTING STARTED</Typography>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Introduction</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Documentation</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Usage</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Globals</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Elements</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Collections</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Themes</Link>
                </Grid>

                <Grid>
                    <Typography className="footer-item__title" gutterBottom>RESOURCES</Typography>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">API</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Form Validations</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Visibility</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Accessibility</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Community</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Design Defined</Link>
                    <Link className="footer-item__link" href="#" color="inherit" display="block">Marketplace</Link>
                </Grid>

                <Grid>
                    <Typography className="footer-item__title" gutterBottom>SOCIAL MEDIA</Typography>
                    <Typography variant="body2" gutterBottom>
                        Follow us on social media to find out the latest updates on our progress.
                    </Typography>
                    <Box mt={1}>
                        <IconButton href="#" color="inherit"><Twitter /></IconButton>
                        <IconButton href="#" color="inherit"><GitHub /></IconButton>
                        <IconButton href="#" color="inherit"><Facebook /></IconButton>
                        <IconButton href="#" color="inherit"><SportsBasketball /></IconButton> 
                    </Box>
                </Grid>
            </Grid>
        </Toolbar>

        <Toolbar className="footer-toolbar footer-toolbar__second">
            <Typography className="footer-toolbar__typography" gutterBottom>© 2025 Trường Đại học Sư phạm Kỹ thuật Hưng Yên</Typography>
            <LanguageSwitcher />
        </Toolbar>
    </AppBar>
  );
};

export default Footer;
