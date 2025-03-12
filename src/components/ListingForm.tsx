import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Divider,
  Container,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { fileService } from "../services/api";
import { ListingFormData } from "../types";
import { toast } from "react-toastify";

const validationSchema = Yup.object({
  brand: Yup.string().required("Brand is required"),
  model: Yup.string().required("Model is required"),
  price: Yup.string()
    .required("Price is required")
    .matches(/^\d+$/, "Price must be a number")
    .test("positive", "Price must be greater than 0", (value) => {
      return value ? parseInt(value) > 0 : false;
    }),
  mainPhoto: Yup.string().url("Must be a valid URL"),
  additionalPhotos: Yup.array().of(Yup.string().url("Must be a valid URL")),
});

interface ListingFormProps {
  initialValues?: ListingFormData;
  onSubmit: (values: ListingFormData) => Promise<void>;
  mode: "create" | "edit";
}

// Function to format file names
const formatFileName = (fileName: string): string => {
  if (!fileName) return "Photo.jpg";

  // Split filename and extension
  const lastDotIndex = fileName.lastIndexOf(".");
  const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";
  const nameWithoutExtension =
    lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

  // Truncate if longer than 10 chars
  if (nameWithoutExtension.length > 10) {
    return `${nameWithoutExtension.substring(0, 10)}...${extension}`;
  }

  return fileName;
};

export const ListingForm: React.FC<ListingFormProps> = ({
  initialValues,
  onSubmit,
  mode,
}) => {
  const navigate = useNavigate();
  const [mainPhotoFile, setMainPhotoFile] = useState<File | null>(null);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState<File[]>([]);
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string>("");
  const [additionalPhotosPreviews, setAdditionalPhotosPreviews] = useState<
    string[]
  >([]);
  const [existingMainPhoto, setExistingMainPhoto] = useState<string>(
    initialValues?.mainPhoto || ""
  );
  const [existingAdditionalPhotos, setExistingAdditionalPhotos] = useState<
    string[]
  >(initialValues?.additionalPhotos || []);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    main: boolean;
    additional: boolean;
  }>({ main: false, additional: false });

  const handleBackClick = () => {
    navigate("/listings");
  };

  const handleMainPhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setMainPhotoFile(file);
      setMainPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Auto-set example URL for testing purposes
  // React.useEffect(() => {
  //   if (!existingMainPhoto && !mainPhotoFile) {
  //     setExistingMainPhoto(EXAMPLE_PHOTO_URL);
  //   }
  // }, [existingMainPhoto, mainPhotoFile]);

  const handleAdditionalPhotosChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      setAdditionalPhotoFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setAdditionalPhotosPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeMainPhoto = () => {
    setMainPhotoFile(null);
    setMainPhotoPreview("");
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotoFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setAdditionalPhotosPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const removeExistingMainPhoto = () => {
    setExistingMainPhoto("");
  };

  const removeExistingAdditionalPhoto = (index: number) => {
    setExistingAdditionalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: ListingFormData) => {
    try {
      if (!mainPhotoFile && !existingMainPhoto) {
        toast.error("Main photo is required");
        return;
      }

      setIsUploading(true);
      let mainPhotoUrl = mainPhotoFile ? "" : existingMainPhoto;
      let additionalPhotoUrls = [...existingAdditionalPhotos];

      if (mainPhotoFile) {
        try {
          setUploadProgress((prev) => ({ ...prev, main: true }));
          const [mainPhotoUpload] = await fileService.uploadFiles([
            mainPhotoFile,
          ]);
          mainPhotoUrl = mainPhotoUpload.url;
        } catch (error) {
          console.error("Failed to upload main photo:", error);
          toast.error("Failed to upload main photo. Please try again.");
          setUploadProgress((prev) => ({ ...prev, main: false }));
          setIsUploading(false);
          return;
        }
        setUploadProgress((prev) => ({ ...prev, main: false }));
      }

      if (additionalPhotoFiles.length > 0) {
        try {
          setUploadProgress((prev) => ({ ...prev, additional: true }));
          const uploadedPhotos = await fileService.uploadFiles(
            additionalPhotoFiles
          );
          additionalPhotoUrls = [
            ...additionalPhotoUrls,
            ...uploadedPhotos.map((photo) => photo.url),
          ];
        } catch (error) {
          console.error("Failed to upload additional photos:", error);
          toast.warning(
            "Failed to upload additional photos. Only the main photo will be used."
          );
          // Continue without the additional photos
        }
        setUploadProgress((prev) => ({ ...prev, additional: false }));
      }

      const updatedValues = {
        ...values,
        mainPhoto: mainPhotoUrl,
        additionalPhotos: additionalPhotoUrls,
      };

      await onSubmit(updatedValues);
      navigate("/listings");
    } catch (error) {
      console.error("Error submitting form: ", error);
      toast.error("Failed to save listing. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8F8F8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: "16px", sm: "2%" } }}>
        <Paper
          elevation={2}
          sx={{
            overflow: "hidden",
            width: "100%",
            mt: "24px",
            mx: { xs: "auto", sm: "50px" },
            px: { xs: 0, sm: 0 },
          }}
        >
          <Formik
            initialValues={
              initialValues || {
                brand: "",
                model: "",
                price: "",
                mainPhoto: "",
                additionalPhotos: [],
              }
            }
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnMount={true}
          >
            {({ errors, touched, isSubmitting, isValid, values }) => (
              <Form id="listing-form">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    height: "83px",
                    borderBottom: "1px solid #E0E0E0",
                    boxShadow: "0px 5px 15px #00347026",
                    position: "relative",
                    zIndex: 1,
                    bgcolor: "#FFFFFF",
                    borderRadius: "5px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleBackClick}
                  >
                    <CloseIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "16px",
                        fontFamily: "'Inter', sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      {mode === "edit" ? "EDIT LISTING" : "ADD LISTING"}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isUploading ||
                      // Commented out for testing
                      !isValid ||
                      (!mainPhotoFile && !existingMainPhoto) ||
                      !values.brand ||
                      !values.model ||
                      !values.price
                    }
                    sx={{
                      bgcolor: "#1F1DEB",
                      color: "#FFFFFF",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "20px",
                      fontFamily: "'Montserrat', sans-serif",
                      letterSpacing: "0px",
                      textAlign: "center",
                      opacity: 1,
                      py: 1,
                      width: "120px",
                      height: "38px",
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      "&:hover": {
                        bgcolor: "#1816C4",
                      },
                      "&:disabled": {
                        bgcolor: "#8F8EF5",
                        color: "#FFFFFF",
                        width: "120px",
                        height: "38px",
                        borderRadius: "5px",
                        opacity: 0.8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      },
                    }}
                  >
                    {isUploading ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{
                            color: "white",
                            position: "absolute",
                            left: "50%",
                            marginLeft: "-12px",
                          }}
                        />
                        <span
                          style={{ visibility: "hidden", whiteSpace: "nowrap" }}
                        >
                          SAVE LISTING
                        </span>
                      </>
                    ) : (
                      <Box
                        component="span"
                        sx={{ whiteSpace: "nowrap", overflow: "hidden" }}
                      >
                        SAVE LISTING
                      </Box>
                    )}
                  </Button>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      color: "#0C0C21",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      fontSize: "18px",
                      lineHeight: "28px",
                      fontFamily: "'Montserrat', sans-serif",
                      letterSpacing: "0px",
                      opacity: 1,
                      textAlign: "left",
                    }}
                  >
                    GENERAL INFORMATION
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 0.5,
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 300,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "#0C0C21",
                          letterSpacing: "0px",
                          opacity: 1,
                          textAlign: "left",
                        }}
                      >
                        Brand
                      </Typography>
                      <Field
                        as={TextField}
                        name="brand"
                        placeholder="Nissan"
                        fullWidth
                        variant="outlined"
                        error={touched.brand && Boolean(errors.brand)}
                        helperText={touched.brand && errors.brand}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "14px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 0.5,
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 300,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "#0C0C21",
                          letterSpacing: "0px",
                          opacity: 1,
                          textAlign: "left",
                        }}
                      >
                        Model
                      </Typography>
                      <Field
                        as={TextField}
                        name="model"
                        placeholder="Qashqai TekNa 4x4"
                        fullWidth
                        variant="outlined"
                        error={touched.model && Boolean(errors.model)}
                        helperText={touched.model && errors.model}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "14px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 0.5,
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 300,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "#0C0C21",
                          letterSpacing: "0px",
                          opacity: 1,
                          textAlign: "left",
                        }}
                      >
                        Price
                      </Typography>
                      <Field
                        as={TextField}
                        name="price"
                        placeholder="45 900"
                        fullWidth
                        variant="outlined"
                        error={touched.price && Boolean(errors.price)}
                        helperText={touched.price && errors.price}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Divider
                                  orientation="vertical"
                                  sx={{ height: 24, mx: 1 }}
                                />
                                <Typography
                                  sx={{
                                    color: "#666",
                                    fontWeight: 500,
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  BGN
                                </Typography>
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "14px",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2, bgcolor: "#1F1DEB" }} />

                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 600,
                        fontSize: "18px",
                        lineHeight: "28px",
                        color: "#0C0C21",
                        textTransform: "uppercase",
                        mb: 0,
                        textAlign: { xs: "left", sm: "left" },
                      }}
                    >
                      Photos
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 4,
                        alignItems: { xs: "flex-start", sm: "flex-start" },
                        justifyContent: { xs: "flex-start", sm: "flex-start" },
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          flex: "0 0 auto",
                          width: { xs: "100%", sm: "auto" },
                          display: "flex",
                          flexDirection: "column",
                          alignItems: { xs: "flex-start", sm: "flex-start" },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 300,
                            fontSize: "16px",
                            lineHeight: "24px",
                            color: "#0C0C21",
                            mb: 1,
                            textAlign: { xs: "left", sm: "left" },
                            width: "100%",
                          }}
                        >
                          Main photo
                        </Typography>

                        {existingMainPhoto ? (
                          <Box
                            sx={{
                              display: { xs: "flex", sm: "inline-flex" },
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #1F1DEB",
                              borderRadius: 2,
                              pl: 1.5,
                              pr: 0.25,
                              py: 0.25,
                              minWidth: "180px",
                              maxWidth: "180px",
                              height: "28px",
                              color: "#1F1DEB",
                              position: "relative",
                              mx: { xs: "0", sm: 0 },
                            }}
                          >
                            {uploadProgress.main && (
                              <CircularProgress
                                size={16}
                                thickness={5}
                                sx={{
                                  position: "absolute",
                                  left: "8px",
                                  color: "#1F1DEB",
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "14px",
                                lineHeight: "20px",
                                color: "#1F1DEB",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                marginRight: 0.5,
                                flex: "1 1 auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                              }}
                            >
                              {formatFileName(
                                mainPhotoFile ? mainPhotoFile.name : "Photo.jpg"
                              )}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={removeExistingMainPhoto}
                              sx={{
                                ml: 0,
                                p: 0,
                                color: "#EB1D6C",
                                width: "20px",
                                height: "20px",
                                minWidth: "20px",
                                "& .MuiSvgIcon-root": {
                                  fontSize: "16px",
                                },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : mainPhotoPreview ? (
                          <Box
                            sx={{
                              display: { xs: "flex", sm: "inline-flex" },
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #1F1DEB",
                              borderRadius: 2,
                              pl: 1.5,
                              pr: 0.25,
                              py: 0.25,
                              minWidth: "180px",
                              maxWidth: "180px",
                              height: "28px",
                              color: "#1F1DEB",
                              position: "relative",
                              mx: { xs: "0", sm: 0 },
                            }}
                          >
                            {uploadProgress.main && (
                              <CircularProgress
                                size={16}
                                thickness={5}
                                sx={{
                                  position: "absolute",
                                  left: "8px",
                                  color: "#1F1DEB",
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "14px",
                                lineHeight: "20px",
                                color: "#1F1DEB",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                marginRight: 0.5,
                                flex: "1 1 auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                              }}
                            >
                              {formatFileName(
                                mainPhotoFile ? mainPhotoFile.name : "Photo.jpg"
                              )}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={removeMainPhoto}
                              sx={{
                                ml: 0,
                                p: 0,
                                color: "#EB1D6C",
                                width: "20px",
                                height: "20px",
                                minWidth: "20px",
                                "& .MuiSvgIcon-root": {
                                  fontSize: "16px",
                                },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              flex: "0 0 auto",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: {
                                xs: "flex-start",
                                sm: "flex-start",
                              },
                              gap: 1,
                              width: "100%",
                            }}
                          >
                            <label
                              htmlFor="main-photo-input"
                              style={{ cursor: "pointer" }}
                            >
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "0.5px dashed #1F1DEB",
                                  borderRadius: "5px",
                                  width: { xs: "50px", sm: "200px" },
                                  height: { xs: "50px", sm: "42px" },
                                  cursor: "pointer",
                                  "&:hover": {
                                    borderColor: "#1816C4",
                                  },
                                }}
                              >
                                <AddIcon
                                  sx={{
                                    fontSize: 20,
                                    mr: { xs: 0, sm: 1 },
                                    color: "#1F1DEB",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: "14px",
                                    lineHeight: "20px",
                                    color: "#1F1DEB",
                                    display: { xs: "none", sm: "block" },
                                  }}
                                >
                                  UPLOAD
                                </Typography>
                              </Box>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainPhotoChange}
                                style={{ display: "none" }}
                                id="main-photo-input"
                              />
                            </label>
                          </Box>
                        )}
                      </Box>

                      <Box
                        sx={{
                          flex: "1 1 auto",
                          width: { xs: "100%", sm: "auto" },
                          display: "flex",
                          flexDirection: "column",
                          alignItems: { xs: "flex-start", sm: "flex-start" },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 300,
                            fontSize: "16px",
                            lineHeight: "24px",
                            color: "#0C0C21",
                            mb: 1,
                            textAlign: { xs: "left", sm: "left" },
                            width: "100%",
                          }}
                        >
                          Additional photos
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: {
                              xs: "flex-start",
                              sm: "flex-start",
                            },
                            flexWrap: "wrap",
                            width: "100%",
                          }}
                        >
                          <Box
                            component="label"
                            htmlFor="additional-photos-input"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "0.5px dashed #1F1DEB",
                              borderRadius: "5px",
                              width: { xs: "50px", sm: "200px" },
                              height: { xs: "50px", sm: "42px" },
                              cursor: "pointer",
                              "&:hover": {
                                borderColor: "#1816C4",
                              },
                            }}
                          >
                            <AddIcon
                              sx={{
                                fontSize: 20,
                                mr: { xs: 0, sm: 1 },
                                color: "#1F1DEB",
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "14px",
                                lineHeight: "20px",
                                color: "#1F1DEB",
                                display: { xs: "none", sm: "block" },
                              }}
                            >
                              UPLOAD
                            </Typography>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleAdditionalPhotosChange}
                              style={{ display: "none" }}
                              id="additional-photos-input"
                            />
                          </Box>

                          {existingAdditionalPhotos.map((photo, index) => (
                            <Box
                              key={`existing-${index}`}
                              sx={{
                                display: { xs: "flex", sm: "inline-flex" },
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #1F1DEB",
                                borderRadius: 2,
                                pl: 1.5,
                                pr: 0.25,
                                py: 0.25,
                                minWidth: "180px",
                                maxWidth: "180px",
                                height: "28px",
                                color: "#1F1DEB",
                                position: "relative",
                                mx: { xs: "0", sm: 0 },
                                my: 0.5,
                              }}
                            >
                              {uploadProgress.additional && index === 0 && (
                                <CircularProgress
                                  size={16}
                                  thickness={5}
                                  sx={{
                                    position: "absolute",
                                    left: "8px",
                                    color: "#1F1DEB",
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  color: "#1F1DEB",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  marginRight: 1,
                                }}
                              >
                                {formatFileName(
                                  existingAdditionalPhotos[index]
                                    .split("/")
                                    .pop() || `Photo ${index + 1}.jpg`
                                )}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  removeExistingAdditionalPhoto(index)
                                }
                                sx={{ ml: -1, p: 0, color: "#EB1D6C" }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}

                          {additionalPhotosPreviews.map((preview, index) => (
                            <Box
                              key={`new-${index}`}
                              sx={{
                                display: { xs: "flex", sm: "inline-flex" },
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #1F1DEB",
                                borderRadius: 2,
                                pl: 1.5,
                                pr: 0.25,
                                py: 0.25,
                                minWidth: "180px",
                                maxWidth: "180px",
                                height: "28px",
                                color: "#1F1DEB",
                                position: "relative",
                                mx: { xs: "0", sm: 0 },
                                my: 0.5,
                              }}
                            >
                              {uploadProgress.additional && index === 0 && (
                                <CircularProgress
                                  size={16}
                                  thickness={5}
                                  sx={{
                                    position: "absolute",
                                    left: "8px",
                                    color: "#1F1DEB",
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  color: "#1F1DEB",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  marginRight: 1,
                                }}
                              >
                                {formatFileName(
                                  additionalPhotoFiles[index]
                                    ? additionalPhotoFiles[index].name
                                    : `Photo ${index + 1}.jpg`
                                )}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removeAdditionalPhoto(index)}
                                sx={{ ml: -1, p: 0, color: "#EB1D6C" }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
};
