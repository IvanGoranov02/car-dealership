import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import blurSvg from "../assets/blur.svg";

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

// Function for image proxy to avoid CORS issues
const getDisplayUrl = (url: string) => {
  return imageUtils.getProxiedImageUrl(url);
};

// Function to extract file extension from URL
// Not currently used, kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getFileExtension = (url: string): string => {
  try {
    // Remove URL parameters if any
    const cleanUrl = url.split("?")[0];
    // Get filename from URL
    const fileName = cleanUrl.split("/").pop() || "";
    // Get extension (everything after the last dot)
    const extension = fileName.split(".").pop() || "";

    return extension.toUpperCase();
  } catch {
    return "";
  }
};

// Function to shorten long names
const shortenName = (brand: string, model: string): string => {
  const fullName = `${brand} ${model}`;

  if (fullName.length <= 24) {
    return fullName;
  }

  return fullName.substring(0, 24) + "...";
};

export const ListingsPage = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const navigate = useNavigate();
  const { user } = useAuth(); // Access to current user

  // State for hover without debug logs
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  // Infinite scroll states
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const itemsPerPage = 12; // Number of cars per page

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPageNumber((prevPageNumber) => prevPageNumber + 1);
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

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
    setAnchorEl((prevState) => ({
      ...prevState,
      [listingId]: event.currentTarget,
    }));
  };

  const handleMenuClose = (listingId: string) => {
    setAnchorEl((prevState) => ({
      ...prevState,
      [listingId]: null,
    }));
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

  const fetchListings = async (page: number) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = (await listingService.getAllListings({
        pageNumber: page,
        pageSize: itemsPerPage,
      })) as ListingsResponse;

      const newListings = response.docs.map((doc: Car) => ({
        id: doc._id!,
        brand: doc.brand,
        model: doc.model,
        price: doc.price,
        mainPhoto: doc.mainPhoto,
        userId: doc.user?._id || "",
      }));

      if (page === 1) {
        setListings(newListings);
      } else {
        setListings((prevListings) => [...prevListings, ...newListings]);
      }

      // Check if there are more pages
      setHasMore(response.hasNextPage);
    } catch (error) {
      toast.error("Failed to load listings");
      console.error("Error loading listings:", error);
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchListings(pageNumber);
  }, [pageNumber]);

  // Function to check if user can manage the listing
  const canManageListing = (listingUserId: string): boolean => {
    return user?._id === listingUserId;
  };

  if (loading && pageNumber === 1) {
    return (
      <Box sx={{ bgcolor: "#F4F4F7", minHeight: "100vh" }}>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 64px)",
            mt: 10,
          }}
        >
          <CircularProgress sx={{ color: "#1F1DEB" }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F4F4F7", minHeight: "100vh" }}>
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
                fontSize: "20px",
                lineHeight: "30px",
                fontWeight: 700,
                color: "#0C0C21",
                fontFamily: "'Montserrat', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0px",
                opacity: 1,
                textAlign: "left",
              }}
            >
              CAR LISTINGS{" "}
              <Box
                component="span"
                sx={{
                  color: "#0C0C21",
                  fontSize: "inherit",
                  fontWeight: "inherit",
                }}
              >
                ({listings.length})
              </Box>
            </Typography>
          </Box>

          <Grid container spacing={3} columns={{ xs: 1, sm: 8, md: 12 }}>
            {listings.map((listing, index) => (
              <Grid
                item
                xs={1}
                sm={4}
                md={3}
                key={listing.id}
                ref={listings.length === index + 1 ? lastElementRef : null}
              >
                <Card
                  sx={{
                    borderRadius: "5px",
                    boxShadow: "0px 5px 15px #00347026",
                    border: "1px solid #C9C9E3",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    position: "relative",
                    bgcolor: "#FFFFFF",
                    maxWidth: "100%",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0px 16px 32px rgba(0, 0, 0, 0.16)",
                    },
                  }}
                  onMouseEnter={() => handleCardHover(listing.id)}
                  onMouseLeave={handleCardLeave}
                >
                  {/* Show Manage button only if user is the owner */}
                  {canManageListing(listing.userId) && (
                    <Button
                      id={`menu-button-${listing.id}`}
                      aria-controls={
                        anchorEl[listing.id] ? `menu-${listing.id}` : undefined
                      }
                      aria-expanded={anchorEl[listing.id] ? "true" : undefined}
                      aria-haspopup="true"
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
                        fontWeight: 800,
                        borderRadius: 1,
                        boxShadow: "0px 4px 12px rgba(31, 29, 235, 0.16)",
                        display:
                          hoveredCard === listing.id ||
                          Boolean(anchorEl[listing.id])
                            ? "flex"
                            : "none",
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
                  )}

                  <Menu
                    id={`menu-${listing.id}`}
                    anchorEl={anchorEl[listing.id]}
                    open={Boolean(anchorEl[listing.id])}
                    onClose={() => handleMenuClose(listing.id)}
                    MenuListProps={{
                      "aria-labelledby": `menu-button-${listing.id}`,
                    }}
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
                      pt: "50%",
                      bgcolor: "#F4F4F7",
                      overflow: "hidden",
                      borderRadius: "5px 5px 0 0",
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
                      title={`${listing.brand} ${listing.model}`}
                    >
                      {shortenName(listing.brand, listing.model)}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
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
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Loading indicator for more cars */}
          {loadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress sx={{ color: "#1F1DEB" }} size={32} />
            </Box>
          )}

          {/* Message when there are no more cars */}
          {!hasMore && listings.length > 0 && (
            <Box sx={{ textAlign: "center", my: 4 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#666666",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                }}
              >
                No more listings to load
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* Delete dialog */}
      {deleteDialogOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
          }}
          onClick={handleDeleteCancel}
        >
          <Box
            component="img"
            src={blurSvg}
            alt="Background"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "5px",
              maxWidth: "450px",
              width: "100%",
              m: 2,
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              position: "relative",
              zIndex: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                fontWeight: 700,
                fontSize: "18px",
                textAlign: "left",
                pt: 3,
                pb: 1,
                px: 3,
                color: "#0C0C21",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              DELETE LISTING
            </Box>
            <Box sx={{ px: 3, pb: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  color: "#0C0C21",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  lineHeight: "22px",
                }}
              >
                Are you sure you want to delete this listing from the platform?
              </Typography>
            </Box>
            <Box sx={{ px: 3, pb: 3, pt: 1, display: "flex", gap: 2 }}>
              <Button
                onClick={handleDeleteCancel}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#1F1DEB",
                  border: "0.5px solid #1F1DEB",
                  height: "38px",
                  width: "100%",
                  borderRadius: "5px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontSize: "14px",
                  fontFamily: "'Montserrat', sans-serif",
                  "&:hover": {
                    bgcolor: "#F8F8FF",
                    border: "0.5px solid #1F1DEB",
                  },
                }}
              >
                GO BACK
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                sx={{
                  bgcolor: "#E4126B",
                  color: "#FFFFFF",
                  height: "38px",
                  width: "100%",
                  borderRadius: "5px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontSize: "14px",
                  fontFamily: "'Montserrat', sans-serif",
                  "&:hover": {
                    bgcolor: "#C60D59",
                  },
                }}
              >
                DELETE
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Using a hidden dialog to keep accessibility features */}
      <Dialog
        open={false}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            display: "none",
          },
        }}
      >
        <DialogTitle>Hidden</DialogTitle>
        <DialogContent>Hidden</DialogContent>
        <DialogActions>Hidden</DialogActions>
      </Dialog>
    </Box>
  );
};
