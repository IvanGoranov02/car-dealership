import React from "react";
import { Box } from "@mui/material";
import { Header } from "../components/Header";
import { ListingForm } from "../components/ListingForm";
import { listingService } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ListingFormData } from "../types";

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: ListingFormData) => {
    try {
      await listingService.createListing({
        ...values,
        price: parseInt(values.price),
      });
      toast.success("Listing created successfully");
      navigate("/listings");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing. Please try again.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F4F7" }}>
      <Header />
      <Box sx={{ pt: "64px" }}>
        <ListingForm onSubmit={handleSubmit} mode="create" />
      </Box>
    </Box>
  );
};
