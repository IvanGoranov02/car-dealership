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
  IconButton,
} from "@mui/material";
import {
  Edit,
  Delete,
  SettingsOutlined,
  ArrowBackIos,
  ArrowForwardIos,
  FiberManualRecord,
} from "@mui/icons-material";
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
  additionalPhotos: string[];
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

  // State for photo slideshow
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{
    [key: string]: number;
  }>({});

  // Infinite scroll states
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const itemsPerPage = 12; // Number of cars per page

  // Adding new state for the active listing being edited in the mobile modal
  const [activeListingId, setActiveListingId] = useState<string | null>(null);

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

  // Functions for photo slideshow
  const handleNextPhoto = (
    event: React.MouseEvent<HTMLElement>,
    listingId: string
  ) => {
    event.stopPropagation();
    setCurrentPhotoIndex((prevState) => {
      const listing = listings.find((l) => l.id === listingId);
      if (!listing) return prevState;

      const totalPhotos = listing.additionalPhotos.length + 1; // +1 for main photo
      const currentIndex = prevState[listingId] || 0;
      const nextIndex = (currentIndex + 1) % totalPhotos;

      return {
        ...prevState,
        [listingId]: nextIndex,
      };
    });
  };

  const handlePrevPhoto = (
    event: React.MouseEvent<HTMLElement>,
    listingId: string
  ) => {
    event.stopPropagation();
    setCurrentPhotoIndex((prevState) => {
      const listing = listings.find((l) => l.id === listingId);
      if (!listing) return prevState;

      const totalPhotos = listing.additionalPhotos.length + 1; // +1 for main photo
      const currentIndex = prevState[listingId] || 0;
      const prevIndex = (currentIndex - 1 + totalPhotos) % totalPhotos;

      return {
        ...prevState,
        [listingId]: prevIndex,
      };
    });
  };

  const handleSelectPhoto = (
    event: React.MouseEvent<HTMLElement>,
    listingId: string,
    index: number
  ) => {
    event.stopPropagation();
    setCurrentPhotoIndex((prevState) => ({
      ...prevState,
      [listingId]: index,
    }));
  };

  const getCurrentPhotoUrl = (listing: CarListing): string => {
    const index = currentPhotoIndex[listing.id] || 0;
    if (index === 0) {
      return listing.mainPhoto;
    }
    return listing.additionalPhotos[index - 1];
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    listingId: string
  ) => {
    // For desktop version, keep the original behavior
    setAnchorEl((prevState) => ({
      ...prevState,
      [listingId]: event.currentTarget,
    }));

    // For mobile version, set the active listing
    setActiveListingId(listingId);
  };

  const handleMenuClose = (listingId: string) => {
    setAnchorEl((prevState) => ({
      ...prevState,
      [listingId]: null,
    }));

    // Close the mobile modal as well
    setActiveListingId(null);
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
        additionalPhotos: doc.additionalPhotos || [],
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
          mt: { xs: "80px", sm: "5%" },
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
                        bgcolor: user ? "#1F1DEB" : "#666",
                        color: "white",
                        minWidth: { xs: "unset", sm: "auto" },
                        padding: { xs: "2px", sm: "6px 6px" },
                        width: { xs: "22px", sm: "auto" },
                        height: { xs: "22px", sm: "30px" },
                        lineHeight: { xs: 0, sm: "normal" },
                        fontSize: { xs: 11, sm: 13 },
                        fontWeight: 800,
                        borderRadius: { xs: "4px", sm: 1 },
                        boxShadow: "0px 4px 12px rgba(31, 29, 235, 0.16)",
                        display:
                          hoveredCard === listing.id ||
                          Boolean(anchorEl[listing.id])
                            ? "flex"
                            : "none",
                        alignItems: "center",
                        justifyContent: { xs: "center", sm: "flex-start" },
                        gap: { xs: 0, sm: 0 },
                        "&:hover": {
                          bgcolor: "#1816C7",
                          boxShadow: "0px 8px 16px rgba(31, 29, 235, 0.24)",
                        },
                      }}
                      startIcon={
                        <Box sx={{ display: { xs: "none", sm: "flex" } }}>
                          <SettingsOutlined
                            sx={{
                              fontSize: 18,
                              mr: 0.3,
                              ml: 0.3,
                            }}
                          />
                        </Box>
                      }
                    >
                      {/* Mobile version - icon only */}
                      <Box
                        sx={{
                          display: { xs: "flex", sm: "none" },
                          justifyContent: "center",
                          lineHeight: 0,
                          pr: 0.5,
                        }}
                      >
                        <SettingsOutlined sx={{ fontSize: 16 }} />
                      </Box>
                      {/* Desktop version - text */}
                      <Box
                        sx={{
                          display: { xs: "none", sm: "block" },
                          fontSize: "13px",
                          fontWeight: 1000,
                          ml: -0.5,
                        }}
                      >
                        MANAGE
                      </Box>
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
                    sx={{
                      "& .MuiMenu-paper": {
                        display: { xs: "none", sm: "block" },
                      },
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
                      image={getDisplayUrl(getCurrentPhotoUrl(listing))}
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

                    {/* Navigation arrows - only show if there are additional photos */}
                    {listing.additionalPhotos.length > 0 && (
                      <>
                        <IconButton
                          onClick={(e) => handlePrevPhoto(e, listing.id)}
                          sx={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(255, 255, 255, 0.7)",
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.9)",
                            },
                            width: 30,
                            height: 30,
                            zIndex: 2,
                            opacity: hoveredCard === listing.id ? 1 : 0,
                            transition: "opacity 0.3s ease",
                          }}
                        >
                          <ArrowBackIos sx={{ fontSize: 16, ml: 1 }} />
                        </IconButton>

                        <IconButton
                          onClick={(e) => handleNextPhoto(e, listing.id)}
                          sx={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(255, 255, 255, 0.7)",
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.9)",
                            },
                            width: 30,
                            height: 30,
                            zIndex: 2,
                            opacity: hoveredCard === listing.id ? 1 : 0,
                            transition: "opacity 0.3s ease",
                          }}
                        >
                          <ArrowForwardIos sx={{ fontSize: 16 }} />
                        </IconButton>

                        {/* Photo indicators */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: 0.5,
                            zIndex: 2,
                            opacity: hoveredCard === listing.id ? 1 : 0,
                            transition: "opacity 0.3s ease",
                          }}
                        >
                          {[listing.mainPhoto, ...listing.additionalPhotos].map(
                            (_, index) => (
                              <Box
                                key={index}
                                onClick={(e) =>
                                  handleSelectPhoto(e, listing.id, index)
                                }
                                sx={{
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 0.3,
                                }}
                              >
                                <FiberManualRecord
                                  sx={{
                                    fontSize: 8,
                                    color:
                                      (currentPhotoIndex[listing.id] || 0) ===
                                      index
                                        ? "#1F1DEB"
                                        : "rgba(255, 255, 255, 0.7)",
                                  }}
                                />
                              </Box>
                            )
                          )}
                        </Box>
                      </>
                    )}
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

      {/* Mobile version of the menu - modal window from the bottom */}
      {activeListingId && (
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99999,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleMenuClose(activeListingId);
          }}
        >
          <Box
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "#FFFFFF",
              width: "100%",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              boxShadow: "0px -4px 12px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ textAlign: "center", p: 2 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#0C0C21",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Please select
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                "&:active": {
                  bgcolor: "rgba(0, 0, 0, 0.03)",
                },
              }}
              onClick={() => handleEdit(activeListingId)}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                <Edit sx={{ fontSize: 24, color: "#1F1DEB" }} />
              </Box>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#0C0C21",
                }}
              >
                Edit listing
              </Typography>
            </Box>

            <Box
              sx={{
                borderTop: "1px solid #E0E0E0",
                mx: 0,
              }}
            />

            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                pb: 3,
                "&:active": {
                  bgcolor: "rgba(0, 0, 0, 0.03)",
                },
              }}
              onClick={() => handleDeleteClick(activeListingId)}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                <Delete sx={{ fontSize: 24, color: "#E4126B" }} />
              </Box>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#0C0C21",
                }}
              >
                Delete Listing
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

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
