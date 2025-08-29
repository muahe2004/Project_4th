import React, { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";

import "./Loading.css";

const Loading: React.FC = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; 
    };
  }, []);

  return (
    <Box className="primary-loading-box">
      <CircularProgress size={60} thickness={4} className="primary-loading-spinner"/>
    </Box>
  );
};

export default Loading;