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
      setIsUploading(true);
      let mainPhotoUrl = mainPhotoFile ? "" : existingMainPhoto;
      let additionalPhotoUrls = [...existingAdditionalPhotos];

      if (mainPhotoFile) {
        setUploadProgress((prev) => ({ ...prev, main: true }));
        const [mainPhotoUpload] = await fileService.uploadFiles([
          mainPhotoFile,
        ]);
        mainPhotoUrl = mainPhotoUpload.url;
        setUploadProgress((prev) => ({ ...prev, main: false }));
      }

      if (additionalPhotoFiles.length > 0) {
        setUploadProgress((prev) => ({ ...prev, additional: true }));
        const uploadedPhotos = await fileService.uploadFiles(
          additionalPhotoFiles
        );
        additionalPhotoUrls = [
          ...additionalPhotoUrls,
          ...uploadedPhotos.map((photo) => photo.url),
        ];
        setUploadProgress((prev) => ({ ...prev, additional: false }));
      }

      const updatedValues = {
        ...values,
        mainPhoto: mainPhotoUrl,
        additionalPhotos: additionalPhotoUrls,
      };

      await onSubmit(updatedValues);
      toast.success(
        `Car listing ${mode === "create" ? "created" : "updated"} successfully!`
      );
      navigate("/");
    } catch (error) {
      console.error("Error submitting form: ", error);
      toast.error("Failed to save listing. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8F8F8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: "8px", sm: "2%" } }}>
        <Paper
          elevation={2}
          sx={{
            overflow: "hidden",
            width: "100%",
            mt: "24px",
            mx: "50px",
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
          >
            {({ errors, touched, isSubmitting, isValid, dirty }) => (
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
                    disabled={isSubmitting || !isValid || !dirty || isUploading}
                    sx={{
                      bgcolor: "#1F1DEB",
                      color: "white",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      fontSize: "14px",
                      py: 1,
                      px: 3,
                      borderRadius: 2,
                      fontFamily: "'Inter', sans-serif",
                      "&:hover": {
                        bgcolor: "#1816C4",
                      },
                      "&:disabled": {
                        bgcolor: "#9E9E9E",
                        color: "#F5F5F5",
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
                        <span style={{ visibility: "hidden" }}>
                          SAVE LISTING
                        </span>
                      </>
                    ) : (
                      "SAVE LISTING"
                    )}
                  </Button>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      color: "#000",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "'Inter', sans-serif",
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
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          color: "#666",
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
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          color: "#666",
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
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          color: "#666",
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
                        mb: 2,
                      }}
                    >
                      Photos
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 4,
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ flex: "0 0 auto" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 300,
                            fontSize: "16px",
                            lineHeight: "24px",
                            color: "#0C0C21",
                            mb: 1,
                            textAlign: "left",
                          }}
                        >
                          Main photo
                        </Typography>

                        {existingMainPhoto ? (
                          <Box
                            sx={{
                              display: "inline-flex",
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
                              {mainPhotoFile?.name
                                ?.split(".")
                                .slice(0, -1)
                                .join(".") || "IMAGE-NEW-313"}
                              .PNG
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
                              display: "inline-flex",
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
                              {mainPhotoFile
                                ? `${mainPhotoFile.name
                                    .split(".")
                                    .slice(0, -1)
                                    .join(".")}${mainPhotoFile.name.substring(
                                    mainPhotoFile.name.lastIndexOf(".")
                                  )}`
                                : "IMAGE-NEW-313.PNG"}
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
                          <label
                            htmlFor="main-photo-input"
                            style={{ cursor: "pointer" }}
                          >
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                border: "2px dashed #1F1DEB",
                                borderRadius: 2,
                                pl: 2,
                                py: 0.5,
                                minWidth: "240px",
                                cursor: "pointer",
                                "&:hover": {
                                  borderColor: "#1816C4",
                                },
                              }}
                            >
                              <AddIcon
                                sx={{ fontSize: 20, mr: 1, color: "#1F1DEB" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  color: "#1F1DEB",
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
                        )}
                      </Box>

                      <Box sx={{ flex: "1 1 auto" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 300,
                            fontSize: "16px",
                            lineHeight: "24px",
                            color: "#0C0C21",
                            mb: 1,
                            textAlign: "left",
                          }}
                        >
                          Additional photos
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Box
                            component="label"
                            htmlFor="additional-photos-input"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "2px dashed #1F1DEB",
                              borderRadius: 2,
                              pl: 1.5,
                              pr: 0.25,
                              py: 0.25,
                              minWidth: "180px",
                              maxWidth: "180px",
                              height: "28px",
                              cursor: "pointer",
                              "&:hover": {
                                borderColor: "#1816C4",
                              },
                            }}
                          >
                            <AddIcon
                              sx={{ fontSize: 20, mr: 1, color: "#1F1DEB" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "14px",
                                lineHeight: "20px",
                                color: "#1F1DEB",
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
                                display: "inline-flex",
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
                                {`IMAGE-NEW-${index + 1}.PNG`}
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
                                display: "inline-flex",
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
                                {additionalPhotoFiles[index]
                                  ? `${additionalPhotoFiles[index].name
                                      .split(".")
                                      .slice(0, -1)
                                      .join(".")}${additionalPhotoFiles[
                                      index
                                    ].name.substring(
                                      additionalPhotoFiles[
                                        index
                                      ].name.lastIndexOf(".")
                                    )}`
                                  : `IMAGE-NEW-${index + 1}.PNG`}
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
