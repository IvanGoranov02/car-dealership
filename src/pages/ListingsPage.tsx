import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Container,
  Grid,
  CircularProgress,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete, Settings } from "@mui/icons-material";
import { Header } from "../components/Header";
import { listingService, imageUtils } from "../services/api";
import { toast } from "react-toastify";
import { Car } from "../types";
// import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface CarListing {
  id: string;
  brand: string;
  model: string;
  price: number;
  mainPhoto: string;
  userId: string;
}

interface ListingsResponse {
  docs: Car[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Функция за прокси на изображения за избягване на CORS проблеми
const getDisplayUrl = (url: string) => {
  return imageUtils.getProxiedImageUrl(url);
};

export const ListingsPage = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const navigate = useNavigate();

  // State for hover without debug logs
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const handleCardHover = (id: string) => {
    setHoveredCard(id);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    listingId: string
  ) => {
    setAnchorEl({ ...anchorEl, [listingId]: event.currentTarget });
  };

  const handleMenuClose = (listingId: string) => {
    setAnchorEl({ ...anchorEl, [listingId]: null });
  };

  const handleEdit = (listingId: string) => {
    navigate(`/listings/${listingId}/edit`);
    handleMenuClose(listingId);
  };

  const handleDeleteClick = (listingId: string) => {
    setDeleteDialogOpen(listingId);
    handleMenuClose(listingId);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialogOpen) {
      try {
        await listingService.deleteListing(deleteDialogOpen);
        setListings(
          listings.filter((listing) => listing.id !== deleteDialogOpen)
        );
        toast.success("Listing deleted successfully");
      } catch (error) {
        toast.error("Failed to delete listing");
        console.error("Error deleting listing:", error);
      }
      setDeleteDialogOpen(null);
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response =
          (await listingService.getAllListings()) as ListingsResponse;
        setListings(
          response.docs.map((doc: Car) => ({
            id: doc._id!,
            brand: doc.brand,
            model: doc.model,
            price: doc.price,
            mainPhoto: doc.mainPhoto,
            userId: doc.user?._id || "",
          }))
        );
      } catch (error) {
        toast.error("Failed to load listings");
        console.error("Error loading listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh" }}>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 80px)",
            mt: 10,
          }}
        >
          <CircularProgress sx={{ color: "#1F1DEB" }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh" }}>
      <Header />
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          mt: "5%",
          mb: "5%",
          px: { xs: "8px", sm: "2%" },
          width: "100%",
          boxSizing: "border-box",
          "& .MuiContainer-root": {
            maxWidth: "none",
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          <Box
            sx={{
              mb: { xs: 3, sm: 4 },
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "24px", sm: "28px" },
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#000000",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              CAR LISTINGS{" "}
              <Box
                component="span"
                sx={{
                  color: "#000000",
                  fontSize: "inherit",
                  fontWeight: "inherit",
                }}
              >
                ({listings.length})
              </Box>
            </Typography>
          </Box>

          <Grid container spacing={3} columns={{ xs: 1, sm: 8, md: 12 }}>
            {listings.map((listing) => (
              <Grid item xs={1} sm={4} md={3} key={listing.id}>
                <Card
                  sx={{
                    borderRadius: "10px",
                    boxShadow: "0px 5px 15px #00347026",
                    border: "1px solid #C9C9E3",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    position: "relative",
                    bgcolor: "#FFFFFF",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0px 16px 32px rgba(0, 0, 0, 0.16)",
                    },
                  }}
                  onMouseEnter={() => handleCardHover(listing.id)}
                  onMouseLeave={handleCardLeave}
                >
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, listing.id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 999,
                      bgcolor: "#1F1DEB",
                      color: "white",
                      minWidth: "auto",
                      p: 0.8,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 1,
                      boxShadow: "0px 4px 12px rgba(31, 29, 235, 0.16)",
                      display: hoveredCard === listing.id ? "flex" : "none",
                      alignItems: "center",
                      gap: 0.2,
                      "&:hover": {
                        bgcolor: "#1816C7",
                        boxShadow: "0px 8px 16px rgba(31, 29, 235, 0.24)",
                      },
                    }}
                    startIcon={<Settings sx={{ fontSize: 14 }} />}
                  >
                    MANAGE
                  </Button>

                  <Menu
                    anchorEl={anchorEl[listing.id]}
                    open={Boolean(anchorEl[listing.id])}
                    onClose={() => handleMenuClose(listing.id)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    PaperProps={{
                      sx: {
                        mt: 0.5,
                        minWidth: 140,
                        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
                        borderRadius: 1,
                        overflow: "visible",
                        "&::before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: -4,
                          left: 12,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "rotate(45deg)",
                          zIndex: 0,
                          boxShadow: "-3px -3px 5px rgba(0,0,0,0.04)",
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => handleEdit(listing.id)}
                      sx={{
                        py: 0.8,
                        px: 1.2,
                        fontSize: 13,
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.04)",
                        },
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <Edit sx={{ mr: 0.5, fontSize: 16, color: "#1F1DEB" }} />
                      Edit listing
                    </MenuItem>
                    <Box
                      sx={{
                        borderTop: "1px solid #1F1DEB",
                        mx: 1.5,
                        opacity: 0.6,
                      }}
                    />
                    <MenuItem
                      onClick={() => handleDeleteClick(listing.id)}
                      sx={{
                        py: 0.8,
                        px: 1.2,
                        fontSize: 13,
                        "&:hover": {
                          bgcolor: "rgba(211, 47, 47, 0.04)",
                        },
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <Delete
                        sx={{ mr: 0.5, fontSize: 16, color: "#D32F2F" }}
                      />
                      Delete Listing
                    </MenuItem>
                  </Menu>
                  <Box
                    sx={{
                      position: "relative",
                      pt: "65%",
                      bgcolor: "#F5F5F5",
                      overflow: "hidden",
                      borderRadius: "10px 10px 0 0",
                      m: 0,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={getDisplayUrl(listing.mainPhoto)}
                      alt={`${listing.brand} ${listing.model}`}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scale(1.05)",
                      }}
                    />
                  </Box>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "#000000",
                        mb: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      {listing.brand} {listing.model}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1F1DEB",
                        display: "block",
                        fontWeight: 800,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        textAlign: "left",
                      }}
                    >
                      {listing.price.toLocaleString()} BGN
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Dialog
        open={Boolean(deleteDialogOpen)}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this listing?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
