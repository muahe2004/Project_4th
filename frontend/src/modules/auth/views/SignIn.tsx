import React, { useState } from 'react';
import { Container, Box, TextField, Paper, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Button from '../../../components/Button/Button';
import logo from '../../../assets/images/logoUTEHY.png';
import "./styles/SignIn.css";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/LanguageSwitcher/LanguageSwitcher';
import { isRequired } from "../../../utils/validation/validations";
import { useSignIn } from '../apis/sign-in';
import { useNavigate } from "react-router-dom";
// import SnackBar from '../../../components/SnackBar/SnackBar';
import { useAuthStore } from "../../../stores/useAuthStore";
import { homeUrl, layOutAdminUrl } from '../../../routes/urls';
import { ROLES } from '../../../constants/roles';

export function SignIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fetchMe = useAuthStore((state) => state.fetchMe); 

  const [username, setUsername] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const mutation = useSignIn();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleBlurUsername = () => {
    if (!isRequired(username)) {
      setUsernameError("Username is required!");
    } else {
      setUsernameError("");
    }
  };

  const handleSignIn = () => {
    if (!usernameError || usernameError.trim() === "") {
      mutation.mutate(
        { username, password },
        {
          onSuccess: async () => {
            const user = await fetchMe(); 
            if (user?.role === ROLES.ADMIN) {
              navigate(layOutAdminUrl); 
            } else {
              navigate(homeUrl); 
            }
          },
          onError: (error) => {
            const status = error.response?.status;
            if (status === 401) {
              showError("Incorrect username or password!");
            } else if (status === 403) {
              showError("Incorrect username or password!");
            } else {
              showError(error.response?.data?.detail || "An error occurred");
            }
          },
        }
      );
    }
  }

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // const showSuccess = (message: string) => {
  //   setSnackbar({
  //     open: true,
  //     message: message,
  //     severity: "success",
  //   });
  // };

  const showError = (message: string) => {
    setSnackbar({
      open: true,
      message: message,
      severity: "error",
    });
  };

  return (
    <div className="sign-in">
      <Container className="sign-in__container">
        <Paper className="sign-in__paper">
          <Box className="sign-in__box">
            <img src={logo} alt="Logo" className="sign-in__logo" />
          </Box>
          <Box component="form" noValidate autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!usernameError || usernameError.trim() === "") {
                  handleSignIn();
                }
              }
            }}
          >
            {/* username */}
            <TextField
              fullWidth
              label={t('sign-in.username')}
              variant="outlined"
              className="sign-in__text-field"
              value={username}
              onChange={(e) => {
                 setUsername(e.target.value),
                 setUsernameError("")
              }}
              onBlur={handleBlurUsername}
              error={!!usernameError}
              helperText={usernameError}
            />

            {/* password */}
            <FormControl variant="outlined" fullWidth className="sign-in__form-control">
              <InputLabel htmlFor="outlined-adornment-password">{t('sign-in.password')}</InputLabel>
              <OutlinedInput
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'hide the password' : 'display the password'}
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
              onClick={handleSignIn}
              fullWidth variant="contained" 
              className="button-primary"
            >
              {t('sign-in.signIn')}
            </Button>
          </Box>

          <Box className="sign-in__box sign-in__box--flex">
            <LanguageSwitcher className="language-switch__sign--in" />

            <Button
              variant='text'
              disableRipple
              className="button-variant__text sign-button__forget"
            >
              {t('sign-in.forgetPassword')}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* <SnackBar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      /> */}
    </div>
  );
}
