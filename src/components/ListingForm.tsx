import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { listingService, fileService } from "../services/api";
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
  mainPhoto: Yup.string()
    .required("Main photo is required")
    .url("Must be a valid URL"),
  additionalPhotos: Yup.array().of(Yup.string().url("Must be a valid URL")),
});

interface ListingFormProps {
  initialValues?: ListingFormData;
  listingId?: string;
}

export const ListingForm: React.FC<ListingFormProps> = ({
  initialValues,
  listingId,
}) => {
  const navigate = useNavigate();
  const [mainPhotoFile, setMainPhotoFile] = useState<File | null>(null);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState<File[]>([]);

  const handleMainPhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setMainPhotoFile(event.target.files[0]);
    }
  };

  const handleAdditionalPhotosChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setAdditionalPhotoFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (values: ListingFormData) => {
    try {
      let mainPhotoUrl = values.mainPhoto;
      let additionalPhotoUrls = values.additionalPhotos;

      if (mainPhotoFile) {
        const [mainPhotoUpload] = await fileService.uploadFiles([
          mainPhotoFile,
        ]);
        mainPhotoUrl = mainPhotoUpload.url;
      }

      if (additionalPhotoFiles.length > 0) {
        const uploadedPhotos = await fileService.uploadFiles(
          additionalPhotoFiles
        );
        additionalPhotoUrls = uploadedPhotos.map((photo) => photo.url);
      }

      const listingData = {
        brand: values.brand,
        model: values.model,
        price: parseInt(values.price),
        mainPhoto: mainPhotoUrl,
        additionalPhotos: additionalPhotoUrls,
      };

      if (listingId) {
        await listingService.updateListing(listingId, listingData);
        toast.success("Listing updated successfully");
      } else {
        await listingService.createListing(listingData);
        toast.success("Listing created successfully");
      }

      navigate("/listings");
    } catch (error) {
      toast.error(
        listingId ? "Failed to update listing" : "Failed to create listing"
      );
      console.error("Error saving listing:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {listingId ? "Edit Listing" : "Create New Listing"}
      </Typography>

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
        {({ errors, touched, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  name="brand"
                  label="Brand"
                  fullWidth
                  error={touched.brand && Boolean(errors.brand)}
                  helperText={touched.brand && errors.brand}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  name="model"
                  label="Model"
                  fullWidth
                  error={touched.model && Boolean(errors.model)}
                  helperText={touched.model && errors.model}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="price"
                  label="Price"
                  fullWidth
                  error={touched.price && Boolean(errors.price)}
                  helperText={touched.price && errors.price}
                />
              </Grid>
              <Grid item xs={12}>
                <Box mb={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Main Photo
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainPhotoChange}
                    style={{ display: "none" }}
                    id="main-photo-input"
                  />
                  <label htmlFor="main-photo-input">
                    <Button variant="outlined" component="span" fullWidth>
                      Upload Main Photo
                    </Button>
                  </label>
                  {mainPhotoFile && (
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Selected: {mainPhotoFile.name}
                    </Typography>
                  )}
                  {!mainPhotoFile && (
                    <Field
                      as={TextField}
                      name="mainPhoto"
                      label="Main Photo URL"
                      fullWidth
                      error={touched.mainPhoto && Boolean(errors.mainPhoto)}
                      helperText={touched.mainPhoto && errors.mainPhoto}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box mb={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Additional Photos
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalPhotosChange}
                    style={{ display: "none" }}
                    id="additional-photos-input"
                  />
                  <label htmlFor="additional-photos-input">
                    <Button variant="outlined" component="span" fullWidth>
                      Upload Additional Photos
                    </Button>
                  </label>
                  {additionalPhotoFiles.length > 0 && (
                    <Box mt={2}>
                      {additionalPhotoFiles.map((file, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="body2" color="textSecondary">
                            {file.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newFiles = [...additionalPhotoFiles];
                              newFiles.splice(index, 1);
                              setAdditionalPhotoFiles(newFiles);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {additionalPhotoFiles.length === 0 && (
                    <Field
                      as={TextField}
                      name="additionalPhotos"
                      label="Additional Photo URLs (comma-separated)"
                      fullWidth
                      error={
                        touched.additionalPhotos &&
                        Boolean(errors.additionalPhotos)
                      }
                      helperText={
                        touched.additionalPhotos && errors.additionalPhotos
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const urls = e.target.value
                          .split(",")
                          .map((url) => url.trim())
                          .filter(Boolean);
                        setFieldValue("additionalPhotos", urls);
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    {listingId ? "Update Listing" : "Create Listing"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/listings")}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};
