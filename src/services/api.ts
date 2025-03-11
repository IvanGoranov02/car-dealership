import axios from "axios";
import { LoginCredentials, Car, User } from "../types";

const API_URL = import.meta.env.DEV
  ? "/api"
  : "https://automania.herokuapp.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> => {
    const response = await api.post("/user/login", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.put("/user/logout");
  },

  checkEmail: async (email: string): Promise<{ emailExists: boolean }> => {
    const response = await api.post("/user/check", { email });
    return response.data.payload;
  },
};

export const listingService = {
  getAllListings: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    noPagination?: boolean;
  }): Promise<{
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
  }> => {
    const response = await api.post("/listing/list", params || {});
    return response.data.payload;
  },

  getListingById: async (id: string): Promise<Car> => {
    const response = await api.get(`/listing/${id}`);
    return response.data.payload;
  },

  createListing: async (listing: Omit<Car, "id">): Promise<Car> => {
    const response = await api.post("/listing/create", listing);
    return response.data.payload;
  },

  updateListing: async (id: string, listing: Partial<Car>): Promise<Car> => {
    const response = await api.put(`/listing/${id}`, listing);
    return response.data.payload;
  },

  deleteListing: async (id: string): Promise<Car> => {
    const response = await api.delete(`/listing/${id}`);
    return response.data.payload;
  },
};

export const fileService = {
  uploadFiles: async (
    files: File[]
  ): Promise<Array<{ fileName: string; type: string; url: string }>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.payload;
  },
};

// Utility to handle CORS issues with images
export const imageUtils = {
  getProxiedImageUrl: (originalUrl: string): string => {
    if (import.meta.env.DEV) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`;
    }
    return originalUrl;
  },
};
