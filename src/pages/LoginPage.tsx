import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stack,
  InputLabel,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import backgroundImage from "../assets/background.png";
import logo from "../assets/logo.svg";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values);
      toast.success("Login successful!");
      navigate("/listings");
    } catch {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `transparent url(${backgroundImage}) 0% 0% no-repeat padding-box`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(180deg, #1F1DEB 0%, rgba(31, 29, 235, 0.76) 100%)",
          opacity: 0.69,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 1,
          width: isMobile ? "90%" : "400px",
          p: 0,
          my: 4,
          ml: { xs: 0, sm: 0 },
          mr: { xs: 0, sm: 0 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            py: isMobile ? 8 : 12,
            px: isMobile ? 6 : 8,
            mx: isMobile ? 0 : -10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: isMobile ? "75%" : "100%",
            bgcolor: "background.paper",
            borderRadius: { xs: 4, sm: 1 },
            boxShadow: isMobile ? "0px 4px 20px rgba(0, 0, 0, 0.15)" : "none",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="AutoMania Logo"
            sx={{
              width: isMobile ? 180 : 280,
              mb: isMobile ? 4 : 8,
              color: "#1F1DEB",
            }}
          />
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              color: "#000000",
              mb: isMobile ? 4 : 8,
              fontSize: { xs: "24px", sm: "24px" },
              fontWeight: 600,
              letterSpacing: "0.1em",
              fontFamily: "'Montserrat', sans-serif",
              textAlign: "center",
            }}
          >
            WELCOME BACK
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form style={{ width: "100%" }}>
                <Stack spacing={isMobile ? 4 : 5}>
                  <Box>
                    <InputLabel
                      htmlFor="email"
                      sx={{
                        mb: 1,
                        color: "#000000",
                        fontSize: "16px",
                        fontWeight: 500,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      Email
                    </InputLabel>
                    <Field
                      as={TextField}
                      id="email"
                      name="email"
                      variant="outlined"
                      fullWidth
                      placeholder="johndoe@gmail.com"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        sx: {
                          height: "48px",
                          backgroundColor: "#F4F4F7",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#E0E0E0",
                            borderRadius: 1.5,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                            borderWidth: "1px",
                          },
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "16px",
                        },
                      }}
                      InputLabelProps={{
                        shrink: true,
                        sx: { display: "none" },
                      }}
                    />
                  </Box>
                  <Box>
                    <InputLabel
                      htmlFor="password"
                      sx={{
                        mb: 1,
                        color: "#000000",
                        fontSize: "16px",
                        fontWeight: 500,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      Password
                    </InputLabel>
                    <Field
                      as={TextField}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              sx={{
                                color: "#1F1DEB",
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          height: "48px",
                          backgroundColor: "#F4F4F7",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#E0E0E0",
                            borderRadius: 1.5,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                            borderWidth: "1px",
                          },
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "16px",
                        },
                      }}
                      InputLabelProps={{
                        shrink: true,
                        sx: { display: "none" },
                      }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      bgcolor: "#1F1DEB",
                      "&:hover": {
                        bgcolor: "#1816C7",
                      },
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      boxShadow: "none",
                      borderRadius: 1.5,
                      mt: isMobile ? 6 : 6,
                      textTransform: "uppercase",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {isLoading ? "Signing in..." : "LOG IN"}
                  </Button>
                </Stack>
                <Box sx={{ mt: 5, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666666",
                      fontSize: "16px",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      style={{
                        color: "#1F1DEB",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Register
                    </Link>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
};
