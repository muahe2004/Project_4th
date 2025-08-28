import React, { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const Loading: React.FC = () => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto"; 
        };
    }, []);

  return (
    <Box className="primary-loading-box"
        sx={{
            
        }}
    >
      <CircularProgress size={60} thickness={4} className="primary-loading-spinner" />
    </Box>
  );
};

export default Loading;
