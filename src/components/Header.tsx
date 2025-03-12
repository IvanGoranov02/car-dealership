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
        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.18)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          height: 64,
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
              p: 0,
              "&:hover": {
                bgcolor: "transparent",
                opacity: 0.8,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <PersonOutline
                sx={{
                  color: user ? "#1F1DEB" : "#666",
                  fontSize: 30,
                }}
              />
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                }}
              >
                {user ? `HI, ${user.fullName.toUpperCase()}` : "LOG IN"}
              </Box>
            </Box>
          </Button>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              bgcolor: "#E0E0E0",
              width: "2px",
              display: { xs: "none", sm: "block" },
            }}
          />

          <Button
            variant="contained"
            onClick={() => navigate("/listings/new")}
            sx={{
              bgcolor: "#1F1DEB",
              "&:hover": {
                bgcolor: "#1816C7",
              },
              height: 36,
              borderRadius: 1,
              boxShadow: "none",
              px: 0.8,
              fontSize: 14,
              fontWeight: 600,
              display: { xs: "none", sm: "flex" },
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <Add sx={{ fontSize: 24 }} />
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: 0,
                  fontStyle: "normal",
                }}
              >
                ADD LISTING
              </Box>
            </Box>
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <IconButton
                onClick={handleProfileAction}
                sx={{
                  color: user ? "#1F1DEB" : "#666",
                  p: 0.5,
                }}
              >
                <PersonOutline sx={{ fontSize: 28 }} />
              </IconButton>

              <Divider
                orientation="vertical"
                sx={{
                  bgcolor: "#787884",
                  width: "1px",
                  height: "30px",
                  alignSelf: "center",
                  my: "auto",
                }}
              />

              <IconButton
                onClick={() => navigate("/listings/new")}
                sx={{
                  color: "#FFFFFF",
                  bgcolor: "#1F1DEB",
                  p: 0.5,
                  ml: 0.5,
                  borderRadius: "4px",
                  minWidth: "32px",
                  minHeight: "32px",
                  "&:hover": {
                    bgcolor: "#1816C7",
                  },
                }}
              >
                <Add sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
