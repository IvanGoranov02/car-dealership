import React from "react";
import { Box } from "@mui/material";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#F8F8F8",
      }}
    >
      {children}
    </Box>
  );
};
