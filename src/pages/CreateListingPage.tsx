import React from "react";
import { Layout } from "../components/Layout";
import { ListingForm } from "../components/ListingForm";

export const CreateListingPage: React.FC = () => {
  return (
    <Layout>
      <ListingForm />
    </Layout>
  );
};
