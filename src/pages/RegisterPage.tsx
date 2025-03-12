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
  fullName: Yup.string()
    .matches(
      /^(\S+\s+\S+)$/,
      "Full name must contain first name and last name separated by space"
    )
    .required("Full name is required"),
});

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (values: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    try {
      await register(values);
      toast.success("Registration successful!");
      navigate("/listings");
    } catch {
      toast.error("Registration failed. Please try again.");
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
              mb: 6,
              fontSize: "24px",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            CREATE ACCOUNT
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}
          <Formik
            initialValues={{ email: "", password: "", fullName: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form style={{ width: "100%" }}>
                <Stack spacing={4}>
                  <Box>
                    <InputLabel
                      htmlFor="fullName"
                      sx={{
                        mb: 1,
                        color: "#000000",
                        fontSize: "14px",
                        fontWeight: 400,
                      }}
                    >
                      Full Name
                    </InputLabel>
                    <Field
                      as={TextField}
                      id="fullName"
                      name="fullName"
                      variant="outlined"
                      fullWidth
                      error={touched.fullName && Boolean(errors.fullName)}
                      helperText={touched.fullName && errors.fullName}
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
                      mt: 4,
                    }}
                  >
                    {isLoading ? "REGISTERING..." : "REGISTER"}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{ color: "#666666", fontSize: "14px" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#1F1DEB",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
