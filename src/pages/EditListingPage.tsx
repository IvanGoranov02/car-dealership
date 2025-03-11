import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { ListingForm } from "../components/ListingForm";
import { listingService } from "../services/api";
import { Car, ListingFormData } from "../types";
import { toast } from "react-toastify";
import { Header } from "../components/Header";

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<Car | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (id) {
          const data = await listingService.getListingById(id);
          setListing(data);
        }
      } catch (error) {
        toast.error("Failed to fetch listing");
        console.error("Error fetching listing:", error);
        navigate("/listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const handleSubmit = async (values: ListingFormData) => {
    try {
      if (id) {
        const listingData: Partial<Car> = {
          brand: values.brand,
          model: values.model,
          price: parseInt(values.price),
          mainPhoto: values.mainPhoto,
          additionalPhotos: values.additionalPhotos,
        };
        await listingService.updateListing(id, listingData);
        toast.success("Listing updated successfully");
        navigate("/listings");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#F5F5F5",
          py: "5%",
          px: "5%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F5" }}>
      <Header />
      <Box sx={{ pt: "80px" }}>
        <ListingForm
          initialValues={{
            brand: listing.brand,
            model: listing.model,
            price: listing.price.toString(),
            mainPhoto: listing.mainPhoto,
            additionalPhotos: listing.additionalPhotos,
          }}
          onSubmit={handleSubmit}
          mode="edit"
        />
      </Box>
    </Box>
  );
};
