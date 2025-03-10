import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  Container,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { listingService } from "../services/api";
import { Car } from "../types";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingService.getAllListings();
      setListings(response.docs);
    } catch (error) {
      toast.error("Failed to fetch listings");
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await listingService.deleteListing(id);
      toast.success("Listing deleted successfully");
      fetchListings();
    } catch (error) {
      toast.error("Failed to delete listing");
      console.error("Error deleting listing:", error);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/listings/${id}/edit`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1">
          Car Listings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/listings/new")}
        >
          Add New Listing
        </Button>
      </Box>

      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={listing.mainPhoto}
                alt={`${listing.brand} ${listing.model}`}
              />
              <CardContent>
                <Typography variant="h6" component="h2">
                  {listing.brand} {listing.model}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Price: ${listing.price}
                </Typography>
                {user && user._id === listing.user._id && (
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(listing._id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(listing._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
