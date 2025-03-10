import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ListingForm } from "../components/ListingForm";
import { listingService } from "../services/api";
import { Car, ListingFormData } from "../types";
import { toast } from "react-toastify";

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!listing) {
    return null;
  }

  const initialValues: ListingFormData = {
    brand: listing.brand,
    model: listing.model,
    price: listing.price.toString(),
    mainPhoto: listing.mainPhoto,
    additionalPhotos: listing.additionalPhotos,
  };

  return (
    <Layout>
      <ListingForm initialValues={initialValues} listingId={id} />
    </Layout>
  );
};
