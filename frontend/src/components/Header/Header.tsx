import React, { type MouseEvent, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material';

import "./Header.css"
import logo from '../../assets/images/logoUTEHY.png';


const Header: React.FC = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" className="header">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box className="header-flex">
          <img src={logo} alt="Logo" className="header-logo"/>
          <Typography variant="h1" className="header-title">UniCore</Typography>
        </Box>

        <Stack className="header-menu" direction="row">
          <Button className="header-menu__item" disableRipple color="inherit">Home</Button>
          <Button className="header-menu__item" disableRipple color="inherit">Training Program</Button>
          <Button className="header-menu__item" disableRipple color="inherit">Registration</Button>
          <Button className="header-menu__item" disableRipple color="inherit">Class Schedule</Button>
          <Button className="header-menu__item" disableRipple color="inherit">Exam Schedule</Button>
          <Button className="header-menu__item" disableRipple color="inherit">Finance</Button>
          <Button className="header-menu__item" disableRipple color="inherit">Online Learning</Button>
        </Stack>

        <Box>
          <IconButton onClick={handleOpenUserMenu}>
            <Avatar alt="User Avatar" src="" className="header-avatar"/>
          </IconButton>
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            className="header-menu"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleCloseUserMenu}>Hồ sơ cá nhân</MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>Cài đặt</MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>Logout</MenuItem>
          </Menu>

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
