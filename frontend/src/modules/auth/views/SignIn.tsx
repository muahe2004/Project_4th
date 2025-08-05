import React from 'react';
import { Container, Box, TextField, Paper, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Button from '../../../components/Button/Button';
import logo from '../../../assets/images/logoUTEHY.png';
import "./styles/SignIn.css"

export function SignIn() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [country, setCountry] = React.useState('VN');

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Đoạn này cần tách ra 1 file khác.
  const countries = [
    {
      code: 'VN',
      label: 'Vietnamese',
      phone: '84',
    },
    {
      code: 'GB',
      label: 'English',
      phone: '44',
    },
    {
      code: 'JP',
      label: 'Japanese',
      phone: '81',
    },
  ];

  const handleChange = (event: SelectChangeEvent) => {
    setCountry(event.target.value);
  };
  return (
    <div className="sign-in">
      <Container className="sign-in__container">
        <Paper className="sign-in__paper">
          <Box className="sign-in__box">
            <img
              src={logo} alt="Logo" 
              className="sign-in__logo" />
          </Box>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              className="sign-in__text-field"
            />
            <FormControl variant="outlined" fullWidth className="sign-in__form-control">
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                  <InputAdornment position="end">
                      <IconButton
                      aria-label={
                          showPassword ? 'hide the password' : 'display the password'
                      }
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                      >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                  </InputAdornment>
                  }
                  label="Password"
              />
              </FormControl>
            <Button
              fullWidth
              variant="contained"
              className="button-primary"
            >
              Sign In
            </Button>
          </Box>

          <Box className="sign-in__box sign-in__box--flex">
            <FormControl variant='standard'>
              <Select
                labelId="country-select-label"
                id="country-select"
                value={country}
                onChange={handleChange}
                className="sign-in__select"
              >
                {countries.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                      alt=""
                      style={{ marginRight: 8 }}
                    />
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              variant='text' 
              disableRipple
              className="button-variant__text sign-button__forget"
            >Forget Password</Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}
