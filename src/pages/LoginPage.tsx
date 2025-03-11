import React from "react";
import { useNavigate } from "react-router-dom";
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `transparent url(${backgroundImage}) 0% 0% no-repeat padding-box`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
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
          borderRadius: "5px",
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 1,
          width: "500px",
          p: 0,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            py: 10,
            px: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: 0,
            boxShadow: "none",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="AutoMania Logo"
            sx={{ width: 280, mb: 8 }}
          />
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              color: "#000000",
              mb: 8,
              fontSize: "24px",
              fontWeight: 600,
              letterSpacing: "0.1em",
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
                <Stack spacing={5}>
                  <Box>
                    <InputLabel
                      htmlFor="email"
                      sx={{
                        mb: 1,
                        color: "#000000",
                        fontSize: "14px",
                        fontWeight: 400,
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
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        sx: {
                          height: "48px",
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#E0E0E0",
                            borderRadius: 0,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                            borderWidth: "1px",
                          },
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
                        fontSize: "14px",
                        fontWeight: 400,
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
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#E0E0E0",
                            borderRadius: 0,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1F1DEB",
                            borderWidth: "1px",
                          },
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
                      borderRadius: 0,
                      mt: 5,
                    }}
                  >
                    {isLoading ? "Signing in..." : "LOG IN"}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
};
