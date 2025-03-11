import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import { Add, PersonOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo2 from "../assets/logo2.png";

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    handleClose();
  };

  const handleProfileAction = (event: React.MouseEvent<HTMLElement>) => {
    if (user) {
      handleMenu(event);
    } else {
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "white",
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          height: 80,
          px: { xs: "8px", sm: "2%" },
          width: "100%",
          boxSizing: "border-box",
          "& .MuiToolbar-root": {
            maxWidth: "none",
            width: "100%",
          },
        }}
      >
        <Box
          component="img"
          src={logo2}
          alt="AutoMania Logo"
          sx={{
            height: 40,
            cursor: "pointer",
          }}
          onClick={() => navigate("/listings")}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="text"
            onClick={handleProfileAction}
            sx={{
              color: "#000",
              fontSize: 14,
              fontWeight: 400,
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              display: { xs: "none", sm: "flex" },
              minWidth: "auto",
              px: 1.5,
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                bgcolor: "transparent",
                opacity: 0.8,
              },
            }}
            startIcon={
              <PersonOutline
                sx={{
                  color: user ? "#1F1DEB" : "#666",
                  fontSize: 32,
                }}
              />
            }
          >
            {user ? `HI, ${user.fullName.toUpperCase()}` : "LOG IN"}
          </Button>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: "#E0E0E0" }}
          />

          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: 20, mr: -0.5 }} />}
            onClick={() => navigate("/listings/new")}
            sx={{
              bgcolor: "#1F1DEB",
              "&:hover": {
                bgcolor: "#1816C7",
              },
              height: 36,
              borderRadius: 2,
              boxShadow: "none",
              px: 2,
              fontSize: 14,
              fontWeight: 600,
              display: { xs: "none", sm: "flex" },
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ADD LISTING
          </Button>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
                borderRadius: "8px",
                minWidth: 180,
              },
            }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                py: 1.5,
              }}
            >
              Log out
            </MenuItem>
          </Menu>

          {isMobile && (
            <IconButton
              onClick={() => navigate("/listings/new")}
              sx={{
                color: "#1F1DEB",
                p: 1,
              }}
            >
              <Add />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
